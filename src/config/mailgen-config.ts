import mailgen from "mailgen";

const mailGenerator = new mailgen({
  theme: "default",
  product: {
    name: "e-book-api made by rizz",
    link: "https://shopee.co.id/VIAGRA-MMC-ASLI-ORIGINAL-ISI-10-BUTIR-MENAMBAH-STAMINA-PRIA-OBAT-HERBAL-VITALITAS-TAHAN-LAMA-KUAT-i.1025779214.22772428170?sp_atk=befe1f41-2fef-42ab-a530-1ddc206b8018&xptdk=befe1f41-2fef-42ab-a530-1ddc206b8018",
  },
});

export const createConfirmationEmailResponse = (name: string, link: string) => {
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
