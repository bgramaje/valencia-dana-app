// app/privacy-policy/page.js
import React from 'react';
import Link from 'next/link'; // Importar Link de Next.js
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button size="icon" className="flex items-center justify-center">
            <Icon
              icon="ion:chevron-back-circle-outline"
              style={{ width: 25, height: 25 }}
            />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Política de Privacidad</h1>

      </div>

      <h2 className="text-xl font-semibold mt-6">Responsable del Tratamiento</h2>
      <p>
        La app es responsable del tratamiento de los datos proporcionados en el contexto
        de solicitudes de ayuda debido al temporal DANA en Valencia. La finalidad de la
        recolección de datos es exclusivamente para coordinar asistencia y facilitar la
        comunicación en situaciones de emergencia.
      </p>

      <h2 className="text-xl font-semibold mt-6">Finalidad de los Datos Recogidos</h2>
      <p>
        <strong>Descripción y Ubicación:</strong>
        {' '}
        Los usuarios pueden añadir una
        descripción de la ayuda solicitada y proporcionar detalles de ubicación. Estos
        datos se emplean para identificar la naturaleza y ubicación de la asistencia
        necesaria.
      </p>
      <p>
        <strong>Número de Teléfono:</strong>
        {' '}
        El número de teléfono se utiliza
        exclusivamente para contactar con el solicitante en relación con la ayuda
        solicitada.
      </p>

      <h2 className="text-xl font-semibold mt-6">Consentimiento</h2>
      <p>
        Al enviar la solicitud de ayuda, los usuarios aceptan que la información
        proporcionada en el campo de descripción y su número de teléfono sean utilizados
        con el propósito de facilitar la asistencia en emergencias.
      </p>

      <h2 className="text-xl font-semibold mt-6">Confidencialidad y Seguridad de los Datos</h2>
      <p>
        Nos comprometemos a proteger la privacidad de los datos proporcionados y a asegurar
        que se usen solo con el fin de coordinar asistencia en situaciones de emergencia.
        Los datos no se compartirán con terceros, salvo con los organismos necesarios para
        responder a la emergencia.
      </p>

      <h2 className="text-xl font-semibold mt-6">Derechos de los Usuarios y Eliminación de Datos</h2>
      <p>
        Los usuarios pueden eliminar sus datos directamente a través de la funcionalidad
        proporcionada en la app, utilizando un código generado al crear la incidencia. Este
        código es necesario para completar la eliminación de los datos.
      </p>
      <p>
        En caso de pérdida del código, los usuarios pueden contactar con el responsable de
        la app en:
        {' '}
        <a href="mailto:boraal.dev@gmail.com" className="text-blue-500 underline">boraal.dev@gmail.com</a>
        {' '}
        para solicitar la eliminación de sus datos.
      </p>
    </div>
  );
}
