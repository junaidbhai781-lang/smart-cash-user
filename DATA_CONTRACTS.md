# Smart Cash – Data contracts (Spark plan, no Cloud Functions)

Admin = a UID listed at `admins/<uid>: true`. Set it ONLY from the Firebase console (clients cannot write `admins`).
Until `appSettings/coinToRupee` and `appSettings/minWithdraw` exist, withdrawals are rejected by the rules and the app shows "Conversion rate abhi tay nahi hai".

| Path | User (client) | Admin |
|---|---|---|
| users/{uid} {name,email,avatar,language,refCode,createdAt} | read/write own; email, refCode, createdAt immutable after creation | read |
| wallets/{uid} {taskCoins, gameCoins(legacy)} | read own | write |
| coinLedger/{uid}/{id} {amount,source,ref,status,ts} | read own | write |
| tasks/{id} {title,description,instructions,reward,category,status,image} | read | write |
| submissions/{uid}/{sid} {taskId,status,ts,note,proofImage(jpeg data URL <=220k chars)} | create once (status=pending); read own | review: status, reason, reviewedBy, reviewedAt; may delete proofImage |
| submissionActive/{uid}/{taskId} = sid | create once (blocks duplicate); read own | clear on rejection (allows resubmit) |
| withdrawals/{uid}/{id} {amount,upi,name,status,rate,ts} | create (status=requested); read own | status requested->approved->paid / rejected, reason, txnRef, approvedAt, paidAt |
| withdrawalActive/{uid} = id | create once | clear after paid/rejected AND deduct wallets/{uid}/taskCoins when paid |
| refCodes/{code} = uid | claim own code once | – |
| referralClaims/{uid} {code,ts}, referrals/{referrerUid}/{uid} {code,status,ts} | new user creates one claim (status=pending); referrer reads own | verified/rewarded/rejected |
| notifications/{uid}/{id}, announcements/{id} | read | write |
| notificationReads/{uid}/{id} = true | write own | – |
| appSettings {hero, coinToRupee, minWithdraw, referral, faq...} | read | write |
| deletionRequests/{uid} = ts | create once | – |

Game rewards: games are practice-only (local score/history). No client path can credit coins.
Limits: one open withdrawal and one submission per task per user are enforced by locks; admin must clear locks. Proof images live in RTDB (1 GB total on Spark) – admin should delete `proofImage` after review.
