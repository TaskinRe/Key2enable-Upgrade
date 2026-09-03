// import express from 'express';
// import supabase from '../supabaseClient.js';
// import crypto from 'crypto';

// const router = express.Router();

// // Load the Clerk webhook secret from env
// const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// function verifyClerkSignature(req, body) {
//   const signature = req.headers['clerk-signature'];
//   const hash = crypto
//     .createHmac('sha256', CLERK_WEBHOOK_SECRET)
//     .update(body)
//     .digest('hex');

//   return signature === hash;
// }

// // Raw body parser middleware just for this route
// router.post('/clerk-sync', express.raw({ type: '*/*' }), async (req, res) => {
//   const rawBody = req.body.toString();

//   // Verify signature
//   if (!verifyClerkSignature(req, rawBody)) {
//     return res.status(401).send('Unauthorized');
//   }

//   const event = JSON.parse(rawBody);
//   if (event.type === 'user.created') {
//     const { id: clerk_user_id, email_addresses, first_name, last_name } = event.data;
//     const email = email_addresses[0]?.email_address || '';
//     const name = `${first_name || ''} ${last_name || ''}`.trim();

//     const { error } = await supabase.from('students').insert([
//       {
//         name,
//         email,
//         clerk_user_id,
//         country: '', // optional
//         group_id: null,
//       }
//     ]);

//     if (error) {
//       console.error("❌ Supabase insert error:", error);
//       return res.status(500).send('DB error');
//     }

//     return res.status(200).send('Student synced!');
//   }

//   res.status(200).send('Ignored');
// });

// export default router;

// backend/routes/clerk.js
import express from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node'; // install this package if not yet done

const router = express.Router();

router.post('/set-role', async (req, res) => {
  const { clerk_user_id, role } = req.body;

  try {
    await clerkClient.users.updateUserMetadata(clerk_user_id, {
      publicMetadata: {
        role,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Clerk update error:', err);
    res.status(500).json({ error: 'Failed to set role in Clerk' });
  }
});

export default router;
