// import { useUser } from "@clerk/clerk-react";
// import { useEffect } from "react";
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function useRegisterTeacher() {
//   const { user, isLoaded } = useUser();

//   useEffect(() => {
//     if (!isLoaded || !user?.id) return;

//     const register = async () => {
//       try {
//         await axios.post(`${BASE_URL}/teachers`, {
//           name: user.fullName || user.firstName || "",
//           email: user.primaryEmailAddress.emailAddress,
//           clerk_user_id: user.id,
//         });
//       } catch (err) {
//         console.error("❌ Error registering teacher:", err);
//       }
//     };

//     register();
//   }, [isLoaded, user]);
// }


import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function useRegisterTeacher() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const register = async () => {
      try {
        // Step 1: Register teacher in Supabase
        const res = await axios.post(`${BASE_URL}/teachers`, {
          name: user.fullName || user.firstName || "",
          email: user.primaryEmailAddress.emailAddress,
          clerk_user_id: user.id,
        });

        // Step 2: Set Clerk role (only if teacher was newly created)
        if (res.data?.message !== 'Teacher already exists') {
          await axios.post(`${BASE_URL}/clerk/set-role`, {
            clerk_user_id: user.id,
            role: "teacher",
          });
          console.log("✅ Clerk role set to teacher");
        }

      } catch (err) {
        console.error("❌ useRegisterTeacher error:", err);
      }
    };

    register();
  }, [isLoaded, user]);
}
