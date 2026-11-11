const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

app.use(express.json());

const db = mysql.createPool({
   host: "localhost",
   user: "root",
   password: "",
   database: "fitness_db",
   port: 3307


});
app.get("/berletek", async (req, res) => {
   try {
       const [eredmeny] = await db.query(`
           SELECT berletek.id,
               berletek.megnevezes, berletek.ar,
               berletek.ervenyesseg_nap,
               berletek.elerheto,
               tipusok.nev AS tipus_nev FROM berletek INNER JOIN tipusok ON berletek.tipus_id = tipusok.id ORDER BY berletek.ar ASC
       `);
       res.json(eredmeny);
   } catch (error) {
       res.status(500).json({ hiba: error.message });
   }
});

app.get("/berletek/elerheto", async (req, res) => {
   try {
       const [eredmeny] = await db.query(`
           SELECT *
           FROM berletek
           WHERE elerheto = 1
           AND ervenyesseg_nap <= 30
       `);
       res.json(eredmeny);
   } catch (error) {
       res.status(500).json({ hiba: error.message });
   }
});

app.get("/berletek/kereses/:szoveg", async (req, res) => {
   try {
       const szoveg = req.params.szoveg;
       const [eredmeny] = await db.query(
           "SELECT * FROM berletek WHERE megnevezes LIKE ?",
           [`%${szoveg}%`]
       );
       res.json(eredmeny);
   } catch (error) {
       res.status(500).json({ hiba: error.message });
   }
});

app.get("/tipusok/statisztika", async (req, res) => {
   try {
       const [eredmeny] = await db.query(`
           SELECT
               tipusok.nev AS tipus_nev,
               COUNT(berletek.id) AS berletek_szama,
               ROUND(AVG(berletek.ar),
                AS atlagos_ar FROM tipusok LEFT JOIN berletek ON tipusok.id = berletek.tipus_id GROUP BY tipusok.id, tipusok.nev
       `);
       res.json(eredmeny);
   } catch (error) {
       res.status(500).json({ hiba: error.message });
   }
});

app.get("/berletek/dragak", async (req, res) => {
   try {
       const [eredmeny] = await db.query(`
           SELECT megnevezes,ervenyesseg_nap FROM berletek WHERE ar > 20000  ORDER BY ervenyesseg_nap DESC `);
       res.json(eredmeny);
   } catch (error) {
       res.status(500).json({ hiba: error.message });
   }
});

app.listen(3000, () => {
   console.log("Szerver fut a 3000-es porton!");
});
