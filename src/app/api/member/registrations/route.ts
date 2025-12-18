import { NextResponse } from "next/server";
import { EventService } from "@/services/event.service";
import { withErrorHandler } from "@/lib/errors";
import { requireVerifiedMember } from "@/lib/auth-guard";

// GET /api/member/registrations - List my registrations
export const GET = withErrorHandler(async () => {
  const session = await requireVerifiedMember();

  const registrations = await EventService.getRegistrationsForUser(
    session.userId,
  );

  return NextResponse.json(registrations);
});
