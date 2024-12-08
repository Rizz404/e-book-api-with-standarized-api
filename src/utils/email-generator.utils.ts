import mailGenerator from "../config/mailgen.config";

export const signUpEmailResponse = (name: string, link: string) => {
  return mailGenerator.generate({
    body: {
      name,
      intro: `Selamat datang ${name}, sebagai anak yang baik, silahkan konfirmasi email biar bisa login`,
      action: {
        instructions: "Klik konfirmasi email button yak",
        button: {
          text: "Konfirmasi email lu",
          link,
        },
      },
      outro:
        "Berlaku selama 7 jam ya kintil, akun otomatis kehapus kalo gak konfirmasi",
    },
  });
};
