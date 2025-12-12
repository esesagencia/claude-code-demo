import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <MessageIcon size={32} />
        </p>
        <h1 className="text-3xl font-semibold">CHATGPTÚ</h1>
        <p className="text-lg text-muted-foreground">
          Soy <span className="font-semibold">AVRQ SURGPT</span>, un asistente reflexivo diferente.
        </p>
        <p>
          No voy a darte respuestas directas. No voy a resolver tus problemas.
          En su lugar, voy a hacerte preguntas que te hagan pensar.
        </p>
        <p>
          ¿Por qué? Porque cada vez más delegamos nuestro pensamiento crítico en las IAs.
          Esperamos que nos digan qué hacer, cómo hacerlo, cuándo hacerlo.
        </p>
        <p className="font-medium">
          Pero la mejor respuesta no viene de una máquina.
          Viene de ti.
        </p>
        <p className="text-sm text-muted-foreground">
          Un experimento de{" "}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://somossur.es"
            target="_blank"
          >
            SomosSur
          </Link>
          {" "}para recuperar tu pensamiento crítico.
        </p>
      </div>
    </motion.div>
  );
};
