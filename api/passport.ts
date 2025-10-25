import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import { prisma } from "../app/lib/prisma";

// Configuration de la stratégie locale (email/password)
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req: any, username: string, password: string, done) => {
      try {
        // Vérifier si c'est l'utilisateur admin en dev
        const isDev = process.env.NODE_ENV !== "production";
        if (isDev && username === "admin" && password === "admin") {
          return done(null, {
            id: 999,
            username: "admin",
            email: "admin@aethermail.com",
          });
        }

        // Recherche de l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) {
          return done(null, false, { message: "Utilisateur non trouvé" });
        }

        // Vérification du mot de passe
        if (user.password) {
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Mot de passe incorrect" });
          }
        } else {
          // Si pas de mot de passe stocké, essayer IMAP
          const serverConfig = req.body.serverConfig;
          const isValid = await validateImapLogin(
            username,
            password,
            serverConfig,
          );
          if (!isValid) {
            return done(null, false, { message: "Authentification échouée" });
          }
        }

        return done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
        });
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Configuration de la stratégie JWT
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        process.env.JWT_SECRET || "dev-secret-key-change-in-production",
    },
    async (payload, done) => {
      try {
        // Vérifier si c'est l'utilisateur admin
        if (payload.id === 999) {
          return done(null, {
            id: 999,
            username: "admin",
            email: "admin@aethermail.com",
          });
        }

        // Recherche de l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
        });
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Sérialisation de l'utilisateur pour les sessions
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    if (id === "999") {
      return done(null, {
        id: "999",
        username: "admin",
        email: "admin@aethermail.com",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Fonction utilitaire pour valider via IMAP
async function validateImapLogin(
  username: string,
  password: string,
  serverConfig?: any,
): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      // Trouver l'utilisateur par username
      const user = await prisma.user.findUnique({
        where: { username },
        include: { imap: true },
      });

      let imapConfig: any;

      if (serverConfig) {
        // Utiliser les configs du test
        imapConfig = {
          user: serverConfig.imapUser,
          password: serverConfig.imapPass,
          host: serverConfig.imapHost,
          port: serverConfig.imapPort,
          tls: serverConfig.imapTls,
        };
      } else if (user && user.imap) {
        // Utiliser les configs de la DB
        imapConfig = {
          user: user.imap.imapUser,
          password: user.imap.imapPass,
          host: user.imap.host,
          port: user.imap.port,
          tls: user.imap.tls,
        };
      } else {
        // Configs par défaut
        const config = require("../utils/config").default;
        imapConfig = {
          user: `${username}@${config.mailDomain}`,
          password,
          host: config.imapHost,
          port: config.imapPort,
          tls: config.imapTls,
        };
      }

      const imap = new (require("imap"))(imapConfig);

      imap.once("ready", () => {
        imap.end();
        resolve(true);
      });

      imap.once("error", () => {
        resolve(false);
      });

      imap.connect();
    } catch (error) {
      resolve(false);
    }
  });
}

export default passport;
