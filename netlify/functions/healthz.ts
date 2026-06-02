export default async (req: Request) => {
  return new Response(
    JSON.stringify({ status: "ok" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const config = {
  path: "/api/healthz",
};
