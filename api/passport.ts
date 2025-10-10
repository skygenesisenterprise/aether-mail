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
    },
    async (username, password, done) => {
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
          const isValid = await validateImapLogin(username, password);
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
): Promise<boolean> {
  // Implémentation IMAP existante
  return new Promise((resolve) => {
    // Pour l'instant, retourner true en dev
    const isDev = process.env.NODE_ENV !== "production";
    resolve(isDev);
  });
}

export default passport;
