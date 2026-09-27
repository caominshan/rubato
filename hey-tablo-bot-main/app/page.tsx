import { EditorialHeader } from "@/components/editorial/EditorialHeader";
import { ListeningExperience } from "@/components/editorial/ListeningExperience";
import episodes from "@/data/episodes.json";
import segments from "@/data/transcript-segments.json";

export default function HomePage() {
  const verifiedCount = segments.filter((segment) => segment.sourceVerified).length;

  return (
    <main className="page-shell">
      <EditorialHeader />

      <ListeningExperience />

      <footer className="data-note">
        <span>DATA / {episodes.length} EPISODES</span>
        <span>{segments.length} SEGMENTS · {verifiedCount} VERIFIED</span>
        <span>BUILD 0.1 / NEXT.JS</span>
      </footer>
    </main>
  );
}
