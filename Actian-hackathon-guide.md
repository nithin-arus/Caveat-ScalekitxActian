
actian-hackathon-guide
Actian VectorAI DB Guide - Scalekit x Actian x Render Build Day

Quick reference for the Scalekit x Actian x Render Build Day, June 27, SF. Maintained by the Actian VectorAI DB team — last updated: June 24th 2026

Scalekit handles who your agent is acting as: per-user OAuth tokens and scoped permissions. VectorAI DB stores what it remembers, with one isolated collection per user so context never leaks across identities. Render hosts both as private services on the same internal network. The key detail tying all three together: Scalekit’s user identifier and VectorAI DB’s collection naming use the same string. That’s what keeps auth and memory in sync without a separate mapping layer.

Stack architecture

Building something or have questions? Join our Discord. We’re active there during, and after the event.
The Actian Challenge: “Prove it”

Build an agent that acts as a specific user and remembers only what belongs to them. Anyone can assert isolation. Your demo needs to show it.

To enter, your project must use VectorAI DB for per-user memory, Scalekit for user identity, and run on Render with a live URL.

Judging criteria (equal weight):

    Innovation: Is the approach novel? Does it solve the problem in a way we haven’t seen before?
    Technical complexity: How well-built is it? Does it genuinely use all three tools?
    Impact: Does it solve a real problem? Could it scale beyond the demo?
    Presentation & usability: Is the demo clear and compelling? Would someone actually use it?

Prizes
🥇 1st place: $500
🥈 2nd place: $300
🥉 3rd place: $200

Note: Prizes are per team, not per person. Solo entry takes the full amount.
Why this might matter for what you’re building

    Per-user/tenant agent memory that doesn’t leak across identities: relevant if you’re building agents that need to act as a specific user with that user’s own context
    No network hop for retrieval: useful if your demo needs to look fast in front of judges

Ideas worth sitting with

Not solutions, just tensions worth thinking about before you start building. The hackathon’s whole premise is agents acting as a specific person with that person’s real access. These are the same question asked about what an agent remembers, not just what it’s allowed to do.

    The “same agent, different person” problem. Two people use what looks like the same agent. Same tools, same permissions model, completely different judgment calls expected of each. What does the agent actually need to know about who it’s talking to, separate from what it’s cleared to do?

    When access changes, does memory change with it? Someone’s permissions get revoked mid-project. Does everything the agent learned while acting on their behalf become a liability sitting in storage? Quarantine it? Delete it? Keep it but stop using it? There’s no obviously right answer.

    Memory as a trust signal, not just a feature. If an agent’s allowed to act as you, would you trust it more if you could actually see what it remembers about your past interactions with it — and edit or revoke pieces of it? What would that even look like as a UI?

    The handoff problem. A task starts with one person, gets passed to a teammate. How much context should follow it, and how much shouldn’t? Where’s the line between useful continuity and leaking one person’s private context into someone else’s session?

    One agent, many tenants. The same agent serving dozens of different orgs, each with their own tools and history. What’s the smallest thing you could build this weekend that actually proves you got the isolation right, rather than just asserting it?

    Data that can’t leave the room. Some context is too sensitive to ever touch a cloud index — legal, health, internal financial data. What’s something you’d genuinely want an agent to remember locally and permanently, with a hard guarantee it never leaves the machine it’s running on?

Get access

VectorAI DB’s Community Edition comes with 5,000 vectors. Sign up for a free trial key to get 1 million vector embeddings. The key should be sent to you in email after signup.

👉 Get the trial key here
Quickstart

Install to first query, in under 10 minutes. Verified clean on Python 3.11/3.12.

pip install actian-vectorai-client

docker pull actian/vectorai:latest
docker run -d --name vectorai \
  -v ./local_data:/var/lib/actian-vectorai \
  -p 6573-6575:6573-6575 \
  -e ACTIAN_VECTORAI_ACCEPT_EULA=YES \
  actian/vectorai:latest

from actian_vectorai import VectorAIClient, VectorParams, Distance, PointStruct

client = VectorAIClient("localhost:6574")

client.collections.create(
    "my_collection",
    vectors_config=VectorParams(size=128, distance=Distance.Cosine),
)

client.points.upsert("my_collection", [
    PointStruct(id=1, vector=[0.1] * 128, payload={"text": "hello world"}),
])

results = client.points.search("my_collection", vector=[0.1] * 128, limit=5)

One more thing worth knowing: Community Edition’s 5,000 limit caps out across all your collections combined. The limit isn’t enforced instantly — it’s checked roughly every 30 seconds, so writes can succeed and then start failing about half a minute later with no warning at the point of insert. If your writes start mysteriously failing mid-hack, check your total vector count before assuming it’s a bug.

Also installing scalekit-sdk-python? There’s a known conflict — its pinned protobuf<7.0.0 requirement silently downgrades the protobuf version actian-vectorai-client needs, regardless of your Python version. Fix: install scalekit with --no-deps, then explicitly install protobuf>=6.31.1 and grpcio-status>=1.67.0 after. If you hit it, find Siam and he’ll help you solve it.
Pattern: per-user memory, no cross-contamination

If your agent needs to act as a specific user and remember only that user’s own context, VectorAI DB doesn’t have a built-in multi-tenancy API — the isolation has to happen in your code. The simplest reliable way: one collection per user, named off whatever identifier your auth layer already gives you.

from actian_vectorai import VectorAIClient, VectorParams, Distance, CollectionExistsError

client = VectorAIClient("localhost:6574")

def get_or_create_user_collection(user_id: str, dim: int = 384):
    name = f"user-{user_id}-memories"
    try:
        client.collections.create(
            name,
            vectors_config=VectorParams(size=dim, distance=Distance.Cosine),
        )
    except CollectionExistsError:
        pass
    return name

Keep the same dim and distance metric across every user’s collection — both are fixed at creation and can’t be changed without deleting and recreating. Every read/write your agent does should go through this same user_id-derived name, so one user’s agent can never see another’s memory.
Deploying to Render

VectorAI DB only ships as a Docker image, which Render handles natively. Pull actian/vectorai:latest directly as a Docker service, no custom Dockerfile needed. Don’t expose it publicly; keep it on Render’s private network and have your actual agent app (whatever’s serving your public demo URL) connect to it internally.

Two things it won’t start without:

    ACTIAN_VECTORAI_ACCEPT_EULA=YES as an env var on the VectorAI DB service
    A persistent disk mounted at /var/lib/actian-vectorai, or your data won’t survive a redeploy

If you’re also deploying scalekit-sdk-python alongside it and run into issues, it’s likely not a Python-version thing: see the dependency conflict note above, it’ll hit you on Render regardless of runtime version unless you install scalekit with --no-deps.
Where to get help today

    Siam: on-site all day. Find him, happy to pair on it live
    Discord: join here if you want to keep going after the event

Something here wrong or out of date? Open a PR or ping Gergely on Discord (repo owner) - this file is the source of truth.