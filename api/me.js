import { withApi } from "./_lib/auth.js";

// Returns the identity encoded in the token. Used by the frontend on load to
// restore a session.
export default withApi(
  async (req, res, auth) => {
    return res.status(200).json({
      user: { id: auth.sub, name: auth.name, role: auth.role, agentId: auth.agentId || null },
    });
  },
  { roles: [] }
);
