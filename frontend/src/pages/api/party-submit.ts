import type { APIRoute } from "astro";
import { updatePartyParticipationStatus } from "../../server/data/partyParticipation";
import { sanityClient } from "../../server/sanity/client";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { token, participationId } = body;

    if (!token || !participationId) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch participation with all required data for validation
    const participation = await sanityClient.fetch<{
      _id: string;
      accessToken: string;
      tokenExpiresAt?: string;
      status: string;
      answers: any[];
      election: { theses: any[] };
    }>(
      `*[_type == "partyParticipation" && _id == $id][0]{
        _id,
        accessToken,
        tokenExpiresAt,
        status,
        answers,
        election->{ theses }
      }`,
      { id: participationId }
    );

    if (!participation) {
      return new Response(JSON.stringify({ error: "Participation not found" }), {
        status: 404,
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

    // Check if submission is allowed based on status
    const allowedStatuses = ["draft", "invited", "in_progress", "revision_requested"];
    if (!allowedStatuses.includes(participation.status)) {
      return new Response(JSON.stringify({ error: "Already submitted" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify all theses have answers
    const thesesCount = participation.election.theses.length;
    const answersCount = participation.answers?.length || 0;

    if (answersCount !== thesesCount) {
      return new Response(
        JSON.stringify({
          error: `Missing answers: ${answersCount}/${thesesCount} answered`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update status to 'submitted' with timestamp
    const success = await updatePartyParticipationStatus(
      participationId,
      "submitted",
      "submittedAt"
    );

    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to submit" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in party-submit endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
