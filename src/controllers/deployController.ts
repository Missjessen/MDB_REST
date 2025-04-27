/* // src/controllers/deployController.ts
import { RequestHandler } from 'express';
import { deployQueue }     from '../queues/deployQueue';
import { AuthenticatedRequest } from '../interfaces/userReq';

export const enqueueDeploy: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId, campaignId } = req.params;

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  // Vi gemmer alt hvad worker har brug for:
  await deployQueue.add('deployCampaign', {
    sheetId,
    campaignId,
    userId: user._id.toString(),
    refreshToken: user.refreshToken
  });
  res.json({ message: 'Deploy job er på kø. Du får status i Sheet når det er færdigt.' });
  return;
  res.json({ message: 'Deploy job er på kø. Du får status i Sheet når det er færdigt.' });
};
 */