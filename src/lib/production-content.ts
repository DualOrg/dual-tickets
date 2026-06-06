import content from "@/data/dual-production-content.json";
import type { Ticket } from "@/types/dual";

type ContentObject = (typeof content.objects)[number];

export function getProductionContentManifest() {
  return content;
}

export function getProductionContentStatus() {
  return {
    app: content.app,
    version: content.version,
    updatedAt: content.updatedAt,
    contentReady: content.objects.length > 0,
    objectCount: content.objects.length,
    template: content.template,
    targetNetwork: content.network.target,
    orgId: content.network.orgId,
    liveDualMapping: {
      templateEnv: content.template.env,
      templateIdConfigured: Boolean(process.env.DUAL_TICKETS_TEMPLATE_ID),
      credentialsConfigured: Boolean(process.env.DUAL_API_KEY || process.env.DUAL_API_TOKEN),
      writeMode: process.env.DUAL_WRITE_MODE || "read_only",
      publicWrites: process.env.DEMO_PUBLIC_DUAL_WRITES === "true",
    },
  };
}

function toTicket(item: ContentObject): Ticket {
  const c = item.custom;
  return {
    id: item.contentId,
    templateId: process.env.DUAL_TICKETS_TEMPLATE_ID || content.template.slug,
    objectId: item.contentId,
    contentHash: undefined,
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
    updatedAt: content.updatedAt,
    blockchainTxHash: undefined,
    explorerLinks: undefined,
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
