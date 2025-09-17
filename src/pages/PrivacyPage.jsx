import BackButtonOrLink from "../components/BackButtonOrLink";

const PrivacyPage = () => {
   return (
      <div className="min-h-screen bg-neutral-950 text-light flex items-center justify-center p-6">
         <style>
            {`
               @keyframes fadeInUp {
                  0% { opacity: 0; transform: translateY(8px); }
                  100% { opacity: 1; transform: translateY(0); }
               }
               .stagger-item { opacity: 0; }
            `}
         </style>

         <div className="max-w-3xl w-full bg-dark shadow-lg rounded-2xl p-8">
            <h1
               className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-6 flex items-center justify-between stagger-item"
               style={{ animation: "fadeInUp 420ms 0ms both ease-out" }}
            >
               <span>Privacy Policy</span>
               <BackButtonOrLink isLink className={"font-normal"} />
            </h1>

            <p
               className="mb-4 text-base sm:text-lg stagger-item"
               style={{ animation: "fadeInUp 420ms 60ms both ease-out" }}
            >
               Welcome to{" "}
               <span className="font-semibold text-accent">Vesta</span>. We value
               your trust and are committed to protecting your personal
               information.
            </p>

            <h2
               className="text-base sm:text-xl font-semibold mt-6 mb-2 stagger-item"
               style={{ animation: "fadeInUp 420ms 120ms both ease-out" }}
            >
               1. Information We Collect
            </h2>
            <p
               className="mb-4 text-light/70 text-sm sm:text-base stagger-item"
               style={{ animation: "fadeInUp 420ms 180ms both ease-out" }}
            >
               We collect your name, email, and society details only when you
               log in via Google. If you grant access to Google Sheets, we only
               use that access to read/write your society’s data. We do not sell
               or share this data with third parties.
            </p>

            <h2
               className="text-base sm:text-xl font-semibold mt-6 mb-2 stagger-item"
               style={{ animation: "fadeInUp 420ms 240ms both ease-out" }}
            >
               2. How We Use Your Data
            </h2>
            <ul
               className="list-disc pl-6 mb-4 text-light/70 text-sm sm:text-base stagger-item"
               style={{ animation: "fadeInUp 420ms 300ms both ease-out" }}
            >
               <li style={{ animation: "fadeInUp 420ms 320ms both ease-out" }}>To authenticate your login with Google.</li>
               <li style={{ animation: "fadeInUp 420ms 380ms both ease-out" }}>To store and manage society data in Firestore.</li>
               <li style={{ animation: "fadeInUp 420ms 440ms both ease-out" }}>
                  To sync maintenance and expense records with Google Sheets (if
                  enabled).
               </li>
            </ul>

            <h2
               className="text-base sm:text-xl font-semibold mt-6 mb-2 stagger-item"
               style={{ animation: "fadeInUp 420ms 500ms both ease-out" }}
            >
               3. Data Security
            </h2>
            <p
               className="mb-4 text-light/70 text-sm sm:text-base stagger-item"
               style={{ animation: "fadeInUp 420ms 560ms both ease-out" }}
            >
               All data is stored securely on Google Firebase and is accessible
               only by authorized admins. We use industry-standard security
               practices to protect your information.
            </p>

            <h2
               className="text-base sm:text-xl font-semibold mt-6 mb-2 stagger-item"
               style={{ animation: "fadeInUp 420ms 620ms both ease-out" }}
            >
               4. Your Rights
            </h2>
            <p
               className="mb-4 text-light/70 text-sm sm:text-base stagger-item"
               style={{ animation: "fadeInUp 420ms 680ms both ease-out" }}
            >
               You may request deletion of your account and associated data at
               any time by contacting us at{" "}
               <span className="font-semibold text-rose-400">
                  adarsh.patil6266@gmail.com
               </span>
               .
            </p>

            <p
               className="text-xs sm:text-base text-gray-500 mt-6 stagger-item"
               style={{ animation: "fadeInUp 420ms 740ms both ease-out" }}
            >
               Last updated: 17 September 2025
            </p>
         </div>
      </div>
   );
};

export default PrivacyPage;
