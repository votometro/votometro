import type { APIRoute } from "astro";
import { updatePartyAnswer, updatePartyParticipationStatus } from "../../server/data/partyParticipation";
import { sanityClient } from "../../server/sanity/client";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as {
      token?: string;
      participationId?: string;
      thesisKey?: string;
      value?: number;
      justification?: string;
    };
    const { token, participationId, thesisKey, value, justification } = body;

    // Validate required fields
    if (!token || !participationId || !thesisKey || (value !== -1 && value !== 0 && value !== 1)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!justification || justification.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Justification required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify token matches participationId and check authorization
    const participation = await sanityClient.fetch<{
      _id: string;
      accessToken: string;
      tokenExpiresAt?: string;
      status: string;
    }>(
      `*[_type == "partyParticipation" && _id == $id][0]{ _id, accessToken, tokenExpiresAt, status }`,
      { id: participationId }
    );

    if (!participation) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify token matches
    if (participation.accessToken !== token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check token expiration
    if (participation.tokenExpiresAt && new Date(participation.tokenExpiresAt) < new Date()) {
      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if editing is allowed based on status
    const allowedStatuses = ["draft", "invited", "in_progress", "revision_requested"];
    if (!allowedStatuses.includes(participation.status)) {
      return new Response(JSON.stringify({ error: "Cannot edit submitted answers" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const success = await updatePartyAnswer(
      participationId,
      thesisKey,
      value,
      justification
    );

    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to save answer" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update status to 'in_progress' if it's 'draft' or 'invited'
    if (participation.status === "draft" || participation.status === "invited") {
      await updatePartyParticipationStatus(participationId, "in_progress");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in party-answer endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
