'use client';

const GUIDANCE_MESSAGES = {
  overall_photo: "Try adding a full photo of the piece.",
  underside: "An underside photo helps confirm age and construction.",
  joinery_closeup: "A close-up of joinery can help identify craftsmanship.",
  hardware_closeup: "Hardware details can help date the piece.",
  label_photo: "Labels or stamps can identify maker and origin.",
};

export default function GuidanceMessages({ missing, totalPhotos, style }) {
  if (!missing || totalPhotos < 2) return null;

  const active = Object.entries(missing)
    .filter(([_, v]) => v)
    .map(([k]) => GUIDANCE_MESSAGES[k])
    .filter(Boolean);

  if (!active.length) return null;

  return (
    <div style={style}>
      <strong>Suggestions:</strong>
      <ul>
        {active.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
