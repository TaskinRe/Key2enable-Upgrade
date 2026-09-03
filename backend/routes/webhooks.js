// import express from 'express';
// import crypto from 'crypto';
// import supabase from '../supabaseClient.js';
// import dotenv from 'dotenv';
// import axios from 'axios';

// dotenv.config();

// const router = express.Router();

// const CLERK_SIGNATURE_HEADER = 'clerk-signature';

// // POST /webhooks/clerk
// router.post(
//   '/clerk',
//   express.json({
//     verify: (req, res, buf) => {
//       req.rawBody = buf;
//     },
//   }),
//   async (req, res) => {
//     const secret = process.env.CLERK_WEBHOOK_SECRET;
//     const clerkApiKey = process.env.CLERK_SECRET_KEY;
//     const signature = req.headers[CLERK_SIGNATURE_HEADER];

//     if (!signature) {
//       return res.status(401).send('Unauthorized: No signature');
//     }

//     const rawBody = req.rawBody;
//     const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

//     if (signature !== expected) {
//       return res.status(401).send('Unauthorized: Bad signature');
//     }

//     const event = req.body;

//     if (event.type === 'user.created') {
//       const email = event.data.email_addresses[0]?.email_address;
//       const name = `${event.data.first_name} ${event.data.last_name}`;
//       const clerk_user_id = event.data.id;

//       console.log(`👋 New user created: ${email} (${clerk_user_id})`);

//       // See if in teachers table
//       const { data: teacherMatch, error: matchError } = await supabase
//         .from('teachers')
//         .select('*')
//         .eq('email', email)
//         .maybeSingle();

//       if (matchError) return res.status(500).json({ error: 'Supabase match error' });

//       if (teacherMatch) {
//         // ✅ Update clerk_user_id
//         const { error: updateError } = await supabase
//           .from('teachers')
//           .update({ clerk_user_id })
//           .eq('email', email);

//         if (updateError) return res.status(500).json({ error: 'Supabase update error' });

//         console.log('✅ Teacher matched — updating Clerk metadata');

//         // ✅ Call Clerk API to set public metadata
//         await axios.patch(
//           `https://api.clerk.com/v1/users/${clerk_user_id}`,
//           {
//             public_metadata: {
//               role: 'teacher',
//             },
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${clerkApiKey}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         console.log('✅ Clerk public_metadata set to role: teacher');

//       } else {
//         console.log('User not in teachers list — no metadata set.');
//       }
//     }

//     res.status(200).send('Webhook handled ✅');
//   }
// );

// export default router;
