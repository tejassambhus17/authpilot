import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { EvidenceTag } from "@/components/evidence";
export const metadata: Metadata = { title: "How AuthPilot works" };
export default function MethodologyPage() {
  return (
    <article className="page-container methodology-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={13} />
        Back to Explore
      </Link>
      <h1>
        Clarity you can trace
        <br />
        back to the source.
      </h1>
      <p className="page-lead">
        OAuth setup is more than a client ID. AuthPilot brings registration,
        scopes, review, and distribution into one practical plan—and shows where
        that plan comes from.
      </p>
      <section className="article-section">
        <h2>Two apps. One connection.</h2>
        <p>
          Your integration is the software you build. A provider OAuth app is
          the registration that identifies your integration to GitHub, Slack,
          Google, or another provider. Your users authorize that app to access
          specific data through scopes. The provider may separately review your
          app before it can reach a wider audience.
        </p>
        <p>
          Getting a test connection to work and getting permission to distribute
          it are different milestones. AuthPilot helps you plan for both.
        </p>
      </section>
      <section className="article-section">
        <h2>A small library. An open-ended researcher.</h2>
        <p>
          GitHub, Slack, and Google were chosen because they expose different
          integration challenges: OAuth configuration and organization policies,
          commercial distribution and Marketplace review, and consent
          verification tied to scopes and audience.
        </p>
        <div className="methodology-flow">
          <div>
            <h3>Retrieve</h3>
            <p>
              The agent uses OpenAI’s hosted web-search tool to investigate
              current documentation. Research is required, rather than optional
              model memory.
            </p>
          </div>
          <div>
            <h3>Structure & validate</h3>
            <p>
              A second model call organizes the findings. Strict schemas and
              source checks reject malformed output and citation URLs absent
              from the search results.
            </p>
          </div>
          <div>
            <h3>Save & act</h3>
            <p>
              The validated guide is saved as an immutable snapshot. Share the
              URL, export Markdown, and track your own progress in this browser.
            </p>
          </div>
        </div>
        <p style={{ marginTop: 20 }}>
          The journal reports actual search-tool and application events. It does
          not invent page visits, setup attempts, or completion percentages.
        </p>
      </section>
      <section className="article-section" id="evidence">
        <h2>Four labels. No blurred lines.</h2>
        <p>
          Evidence labels describe how a statement is supported. They are not
          guarantees that an integration will work for a particular account.
        </p>
        <div className="evidence-definitions">
          <div className="evidence-definition">
            <EvidenceTag status="source-confirmed" />
            <p>
              A documented requirement linked to a source. Curated guides were
              checked against official documentation. For generated guides,
              citation provenance is checked mechanically; the model’s factual
              interpretation and publisher identity still need human review.
            </p>
          </div>
          <div className="evidence-definition">
            <EvidenceTag status="agent-tested" />
            <p>
              Reserved for an action an agent actually executed and observed.
              AuthPilot currently performs documentation research only and
              rejects this label in generated guides. No seeded guide claims a
              tested OAuth setup.
            </p>
          </div>
          <div className="evidence-definition">
            <EvidenceTag status="estimate" />
            <p>
              A planning judgment, such as hands-on effort. Your experience,
              permissions, app scope, and review feedback can change the work.
              Estimates are not provider commitments.
            </p>
          </div>
          <div className="evidence-definition">
            <EvidenceTag status="unknown" />
            <p>
              Missing, conflicting, inaccessible, or account-specific
              information. Check the source or contact the provider before
              relying on it.
            </p>
          </div>
        </div>
        <p style={{ marginTop: 20 }}>
          Source retrieval dates record when documentation was researched. The
          agent cannot guarantee that a page is exhaustive or unchanged.
          Generated evidence excerpts are supporting summaries, not
          independently verified quotations.
        </p>
      </section>
      <section className="article-section">
        <h2>What the first guides taught us.</h2>
        <ul>
          <li>
            <strong>GitHub:</strong> registration guidance now supports up to
            ten callback URLs and describes expiring tokens by default. Copying
            older assumptions would produce a misleading checklist.
          </li>
          <li>
            <strong>Slack:</strong> development distribution and commercial
            distribution have different rules. Marketplace eligibility and
            review waits are material launch constraints.
          </li>
          <li>
            <strong>Google:</strong> basic identity scopes have testing
            exceptions. Brand and scope verification are different processes,
            and published timing guidance is not fully consistent.
          </li>
        </ul>
        <p>
          The repository’s <code>docs/provider-validation.md</code> records the
          checked claims, official sources, corrections, and unverified account
          actions. Each guide also exposes its own source list.
        </p>
      </section>
      <section className="article-section" id="boundaries">
        <h2>The agent plans. You stay in control.</h2>
        <p>
          AuthPilot can investigate public documentation, compare requirements,
          draft a scope and redirect checklist, identify blockers, and explain
          error recovery. It cannot sign in to your provider accounts, bypass
          permission controls, create OAuth registrations, exchange real tokens,
          submit reviews, or obtain approval.
        </p>
        <p>
          You own account access, credentials, scope judgments, privacy
          policies, domain verification, testing with real users, and review
          submissions. Provider decisions remain with the provider. Never paste
          secrets into the research input.
        </p>
      </section>
      <section className="article-section">
        <h2>Your progress stays yours.</h2>
        <p>
          Guide URLs are public to anyone with access to this deployment. A
          generated guide is an immutable snapshot stored in SQLite locally or
          Turso when deployed. Research inputs are sent to OpenAI; no provider
          credentials are needed.
        </p>
        <p>
          Checklist states are saved in local storage on this browser. They are
          not account-synced, shared with other readers, or included as personal
          completion claims in exported guides. Clearing browser storage clears
          your progress.
        </p>
      </section>
      <section className="article-section" id="setup">
        <h2>Run live research locally.</h2>
        <ol>
          <li>
            Copy <code>.env.example</code> to <code>.env.local</code> in the
            project root.
          </li>
          <li>
            Set <code>OPENAI_API_KEY</code> to your server-side API key. The
            default model is <code>gpt-5.5</code>; its account must support web
            search and structured outputs.
          </li>
          <li>
            Install dependencies with <code>npm install</code>, then start with{" "}
            <code>npm run dev</code>. Restart the server after changing
            environment variables.
          </li>
          <li>
            For Vercel, configure <code>TURSO_DATABASE_URL</code> and{" "}
            <code>TURSO_AUTH_TOKEN</code>. Local files cannot provide durable
            serverless storage.
          </li>
        </ol>
        <p>
          For a shared deployment, set <code>RESEARCH_ACCESS_TOKEN</code> and
          give the token to intended testers. Persistent request budgets also
          limit API usage. The README covers deployment and trade-offs.
        </p>
        <div className="notice neutral" style={{ marginTop: 22 }}>
          <ShieldCheck size={18} />
          <p>
            API keys stay on the server. AuthPilot never asks for your provider
            client secret.
          </p>
        </div>
        <Link href="/research" className="button button-primary">
          Research a provider
          <ArrowRight size={15} />
        </Link>
      </section>
    </article>
  );
}
