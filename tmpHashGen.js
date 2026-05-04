const bcrypt = require('bcrypt');
const users = [
  ['alex.smith@example.com','password123','Alex','2026-01-15'],
  ['jordan.lee@example.com','123456','Jordan','2026-01-20'],
  ['casey.v@example.com','pass_word','Casey','2026-02-02'],
  ['morgan.b@example.com','1234','Morgan','2026-02-10'],
  ['taylor.swift@example.com','qwerty','Taylor','2026-02-14'],
  ['sam.rivera@example.com','12345678','Sam','2026-03-01'],
  ['jamie.fox@example.com','12345','Jamie','2026-03-05'],
  ['riley.page@example.com','test','Riley','2026-03-12'],
  ['quinn.d@example.com','admin','Quinn','2026-03-18'],
  ['skyler.blue@example.com','skyler123','Skyler','2026-03-25']
];
(async () => {
  for (const [email, password, first_name, registration_date] of users) {
    const hash = await bcrypt.hash(password, 10);
    console.log(JSON.stringify({ email, password, hash, first_name, registration_date }));
  }
})();
