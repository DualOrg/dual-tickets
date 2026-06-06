import content from "@/data/dual-production-content.json";
import type { Ticket } from "@/types/dual";

type ContentObject = (typeof content.objects)[number];
const DUAL_EXPLORER_BASE = "https://explorer.dual.network";
const DUAL_L2_EXPLORER_BASE = "https://blockscout.dual.network";

export function getProductionContentManifest() {
  return content;
}

export function getProductionContentStatus() {
  const mappedObjects = content.objects.filter((item) => item.dual?.objectId && item.dual?.readbackVerified);
  const templateId = process.env.DUAL_TICKETS_TEMPLATE_ID || content.template.id || "";
  return {
    app: content.app,
    version: content.version,
    updatedAt: content.updatedAt,
    contentReady: content.objects.length > 0,
    objectCount: content.objects.length,
    mappedObjectCount: mappedObjects.length,
    readbackVerified: mappedObjects.length === content.objects.length,
    template: content.template,
    targetNetwork: content.network.target,
    orgId: content.network.orgId,
    liveDualMapping: {
      templateEnv: content.template.env,
      templateId,
      templateIdConfigured: Boolean(templateId),
      credentialsConfigured: Boolean(process.env.DUAL_API_KEY || process.env.DUAL_API_TOKEN),
      objectIds: mappedObjects.map((item) => item.dual.objectId),
      readbackVerified: mappedObjects.length === content.objects.length,
      writeMode: process.env.DUAL_WRITE_MODE || "read_only",
      publicWrites: process.env.DEMO_PUBLIC_DUAL_WRITES === "true",
    },
  };
}

function toTicket(item: ContentObject): Ticket {
  const c = item.custom;
  const templateId = process.env.DUAL_TICKETS_TEMPLATE_ID || content.template.id || content.template.slug;
  const objectId = item.dual?.objectId || item.contentId;
  return {
    id: item.contentId,
    templateId,
    objectId,
    contentHash: item.dual?.stateHash,
    ticketData: {
      name: c.name,
      eventName: c.eventName,
      eventDate: c.eventDate,
      eventTime: c.eventTime,
      venue: c.venue,
      venueAddress: c.venueAddress,
      category: c.category,
      tier: c.tier as Ticket["ticketData"]["tier"],
      section: c.section,
      seat: c.seat,
      price: c.price,
      originalPrice: c.originalPrice,
      maxResalePrice: c.maxResalePrice,
      description: c.description,
      imageUrl: c.imageUrl,
      perks: c.perks,
    },
    status: c.ticketStatus as Ticket["status"],
    ownerId: content.network.orgId,
    createdAt: content.updatedAt,
    updatedAt: item.dual?.mintedAt || content.updatedAt,
    blockchainTxHash: item.dual?.integrityHash,
    explorerLinks: item.dual?.objectId ? {
      owner: null,
      contentHash: item.dual?.integrityHash ? `${DUAL_L2_EXPLORER_BASE}/tx/${item.dual.integrityHash}` : null,
      integrityHash: `${DUAL_EXPLORER_BASE}/objects/${item.dual.objectId}`,
      org: content.template.id ? `${DUAL_EXPLORER_BASE}/templates/${content.template.id}` : null,
    } : undefined,
  };
}

export function getProductionTickets(): Ticket[] {
  return content.objects.map(toTicket);
}

export function getSeedPayloads() {
  return content.objects.map((item) => ({
    contentId: item.contentId,
    action: {
      mint: {
        template_id: process.env.DUAL_TICKETS_TEMPLATE_ID || "<DUAL_TICKETS_TEMPLATE_ID>",
        num: 1,
        data: {
          metadata: item.metadata,
          custom: item.custom,
        },
      },
    },
  }));
}
