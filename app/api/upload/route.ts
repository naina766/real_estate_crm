import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { successResponse, errorResponse, handleApiError, getUserFromRequest } from "@/lib/api";

// export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "documents";
    const entityType = formData.get("entityType") as string;
    const entityId = formData.get("entityId") as string;
    const docType = (formData.get("type") as string) || "OTHER";

    if (!file) return errorResponse("No file provided", 400);

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) return errorResponse("File size exceeds 20MB limit", 400);

    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/webp",
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("File type not allowed", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isImage = file.type.startsWith("image/");

    const result = await uploadToCloudinary(
      buffer,
      folder as any,
      {
        resourceType: isImage ? "image" : "raw",
        transformation: isImage
          ? [{ quality: "auto", fetch_format: "auto" }]
          : undefined,
      }
    );

    // Save document record to DB
    const document = await prisma.document.create({
      data: {
        name: file.name,
        url: result.url,
        publicId: result.publicId,
        mimeType: file.type,
        size: file.size,
        type: docType as any,
        ...(entityType === "deal" && entityId && { dealId: entityId }),
        ...(entityType === "property" && entityId && { propertyId: entityId }),
        ...(entityType === "client" && entityId && { clientId: entityId }),
      },
    });

    // If property image, set thumbnail if first image
    if (entityType === "property" && entityId && isImage) {
      const property = await prisma.property.findUnique({ where: { id: entityId } });
      if (property && !property.thumbnailUrl) {
        await prisma.property.update({
          where: { id: entityId },
          data: { thumbnailUrl: result.url },
        });
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: "DOCUMENT_UPLOAD",
        title: "Document uploaded",
        description: `File "${file.name}" uploaded`,
        userId: user.userId,
        ...(entityType === "deal" && { dealId: entityId }),
        ...(entityType === "property" && { propertyId: entityId }),
        ...(entityType === "client" && { clientId: entityId }),
      },
    });

    return successResponse(document, "File uploaded successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
