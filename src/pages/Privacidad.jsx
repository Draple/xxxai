import { useLanguage } from '../context/LanguageContext';
import LegalPageLayout from '../components/LegalPageLayout';

const content = {
  es: {
    title: 'Política de privacidad',
    subtitle: 'Cómo XXXAI trata tus datos personales',
    lastUpdated: 'Última actualización: Febrero 2025',
    sections: [
      {
        title: '1. Responsable del tratamiento',
        body: [
          'Los datos personales que nos facilitas al usar XXXAI son tratados por el titular del servicio XXXAI («nosotros», «nuestro»), con la finalidad de prestar el Servicio, gestionar tu cuenta, la facturación y el soporte, así como para cumplir con las obligaciones legales aplicables.',
          'Para cualquier consulta sobre el tratamiento de tus datos o para ejercer tus derechos, puedes contactarnos a través del enlace de contacto indicado en el sitio. Nos comprometemos a responder en los plazos establecidos por la normativa de protección de datos (por ejemplo, RGPD).',
        ],
      },
      {
        title: '2. Datos que recogemos',
        body: [
          'Recogemos los datos que nos proporcionas al registrarte: dirección de correo electrónico, contraseña (almacenada de forma cifrada) y, en su caso, nombre o alias si lo indicas. Si utilizas inicio de sesión con terceros (por ejemplo, Google o Apple), recibimos el identificador que el proveedor nos facilita según su configuración.',
          'En relación con la facturación, podemos recibir o almacenar datos necesarios para el cobro (identificador de transacción, pack de créditos comprado, fecha de compra). Los datos completos de la tarjeta o del método de pago son gestionados por el proveedor de pagos y no se almacenan en nuestros servidores.',
          'También podemos registrar datos técnicos necesarios para el funcionamiento del Servicio: dirección IP, tipo de dispositivo y navegador, logs de acceso y uso (fechas, acciones realizadas), en la medida permitida por la ley y para fines de seguridad, mejora del Servicio y cumplimiento legal.',
        ],
      },
      {
        title: '3. Finalidad y base legal',
        body: [
          'Utilizamos tus datos para: (a) crear y gestionar tu cuenta; (b) procesar pagos y compra de créditos; (c) prestar el Servicio de generación de video; (d) comunicarnos contigo en relación al Servicio (confirmaciones de compra, soporte); (e) cumplir obligaciones legales (facturación, conservación de pruebas) y defender nuestros derechos; (f) mejorar la seguridad y el funcionamiento del sitio.',
          'La base legal es la ejecución del contrato que nos une (prestación del Servicio), el consentimiento cuando así se indique (por ejemplo, comunicaciones comerciales opcionales), y el interés legítimo cuando corresponda (seguridad, mejora del Servicio, reclamaciones).',
        ],
      },
      {
        title: '4. Conservación de los datos',
        body: [
          'Conservamos tus datos mientras mantengas una cuenta activa y, tras la baja o cancelación, durante el tiempo necesario para cumplir obligaciones legales, reclamaciones o auditorías. Los plazos concretos pueden variar según la normativa aplicable (por ejemplo, obligaciones fiscales o contables).',
          'Los datos de facturación y los necesarios para el cumplimiento legal pueden conservarse durante los plazos que exija la normativa aplicable. Una vez cumplidos esos plazos, los datos se suprimen o se anonimizan de forma irreversible.',
        ],
      },
      {
        title: '5. Cesión y transferencias internacionales',
        body: [
          'No vendemos tus datos personales. Podemos compartir datos con proveedores que nos prestan servicios (hosting, pasarelas de pago, herramientas de análisis, envío de correos), que actúan como encargados del tratamiento y están obligados a usarlos solo según nuestras instrucciones y la normativa aplicable.',
          'Algunos de estos proveedores pueden estar fuera del Espacio Económico Europeo (EEE). En ese caso garantizamos las medidas adecuadas según la normativa vigente: cláusulas contractuales tipo aprobadas por la Comisión Europea, decisiones de adecuación, o garantías equivalentes. Puedes solicitar más información sobre las garantías aplicables a través del enlace de contacto.',
        ],
      },
      {
        title: '6. Menores',
        body: [
          'El Servicio está dirigido exclusivamente a personas mayores de 18 años. No recogemos conscientemente datos de menores. Si tienes conocimiento de que un menor nos ha facilitado datos personales, contacta con nosotros para que podamos proceder a su supresión.',
        ],
      },
      {
        title: '7. Cookies y tecnologías similares',
        body: [
          'El sitio puede utilizar cookies y tecnologías similares para el correcto funcionamiento del Servicio (sesión, preferencias), autenticación y, en su caso, análisis de uso. Puedes configurar tu navegador para rechazar o limitar cookies; ten en cuenta que ello puede afectar a algunas funcionalidades del sitio. La información detallada sobre las cookies utilizadas y su gestión se indica en el aviso de cookies o en la configuración del sitio.',
        ],
      },
      {
        title: '8. Tus derechos',
        body: [
          'Tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, limitar su tratamiento, oponerte al tratamiento y a la portabilidad, en los términos previstos en la normativa de protección de datos (por ejemplo, RGPD). También puedes retirar el consentimiento en cualquier momento cuando el tratamiento se base en el consentimiento, sin que ello afecte a la licitud del tratamiento anterior.',
          'Puedes presentar una reclamación ante la autoridad de control competente (por ejemplo, la Agencia Española de Protección de Datos o la autoridad del país en el que residas). Para ejercer estos derechos o cualquier consulta sobre privacidad, utiliza el enlace de contacto del sitio e indica claramente el derecho que deseas ejercer.',
        ],
      },
      {
        title: '9. Seguridad',
        body: [
          'Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida, alteración o destrucción. Las contraseñas se almacenan de forma cifrada. La comunicación con el sitio se realiza mediante conexión segura (HTTPS). Limitamos el acceso a los datos personales al personal que lo necesita para el desempeño de sus funciones.',
          'En caso de incidente de seguridad que pueda afectar a tus datos personales, te informaremos y notificaremos a la autoridad de control cuando la normativa lo exija.',
        ],
      },
      {
        title: '10. Cambios en esta política',
        body: [
          'Podemos actualizar esta política de privacidad. Los cambios se publicarán en esta página con indicación de la fecha de última actualización. Te recomendamos revisarla periódicamente. El uso continuado del Servicio tras la publicación de cambios implica la aceptación de la política actualizada. Si los cambios afectan de forma relevante al tratamiento de tus datos, te lo comunicaremos cuando la ley lo requiera.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    subtitle: 'How XXXAI handles your personal data',
    lastUpdated: 'Last updated: February 2025',
    sections: [
      {
        title: '1. Data controller',
        body: [
          'The personal data you provide when using XXXAI is processed by the owner of the XXXAI service («we», «our»), for the purpose of providing the Service, managing your account, billing and support, and to comply with applicable legal obligations.',
          'For any enquiry about the processing of your data or to exercise your rights, you may contact us through the contact link indicated on the site. We undertake to respond within the time limits established by data protection legislation (e.g. GDPR).',
        ],
      },
      {
        title: '2. Data we collect',
        body: [
          'We collect the data you provide when registering: email address, password (stored in encrypted form) and, where applicable, name or alias if you provide it. If you use third-party login (e.g. Google or Apple), we receive the identifier that the provider makes available to us according to its configuration.',
          'In relation to billing, we may receive or store data necessary for charging (transaction identifier, credit pack purchased, purchase date). Full card or payment method data is handled by the payment provider and is not stored on our servers.',
          'We may also record technical data necessary for the operation of the Service: IP address, device and browser type, access and usage logs (dates, actions performed), to the extent permitted by law and for security, Service improvement and legal compliance purposes.',
        ],
      },
      {
        title: '3. Purpose and legal basis',
        body: [
          'We use your data to: (a) create and manage your account; (b) process payments and credit purchases; (c) provide the video generation Service; (d) communicate with you in relation to the Service (purchase confirmations, support); (e) comply with legal obligations (billing, retention of evidence) and defend our rights; (f) improve the security and operation of the site.',
          'The legal basis is performance of the contract between us (provision of the Service), consent where indicated (e.g. optional marketing communications), and legitimate interest where applicable (security, Service improvement, claims).',
        ],
      },
      {
        title: '4. Data retention',
        body: [
          'We retain your data while you maintain an active account and, after closure or cancellation, for as long as necessary to comply with legal obligations, claims or audits. Specific retention periods may vary according to applicable legislation (e.g. tax or accounting obligations).',
          'Billing data and that required for legal compliance may be retained for the periods required by applicable law. Once those periods have elapsed, the data is deleted or irreversibly anonymised.',
        ],
      },
      {
        title: '5. Sharing and international transfers',
        body: [
          'We do not sell your personal data. We may share data with providers who perform services for us (hosting, payment gateways, analytics tools, email sending), who act as processors and are bound to use it only in accordance with our instructions and applicable law.',
          'Some of these providers may be outside the European Economic Area (EEA). In that case we ensure appropriate safeguards in accordance with current regulations: standard contractual clauses approved by the European Commission, adequacy decisions, or equivalent guarantees. You may request further information on the safeguards applied through the contact link.',
        ],
      },
      {
        title: '6. Minors',
        body: [
          'The Service is intended exclusively for persons over 18 years of age. We do not knowingly collect data from minors. If you are aware that a minor has provided us with personal data, please contact us so that we can proceed to delete it.',
        ],
      },
      {
        title: '7. Cookies and similar technologies',
        body: [
          'The site may use cookies and similar technologies for the proper functioning of the Service (session, preferences), authentication and, where applicable, usage analytics. You can configure your browser to reject or limit cookies; please note that this may affect some site functionality. Detailed information on the cookies used and their management is provided in the cookie notice or in the site settings.',
        ],
      },
      {
        title: '8. Your rights',
        body: [
          'You have the right to access your data, rectify it, have it erased, restrict processing, object to processing and to data portability, under the terms provided by data protection legislation (e.g. GDPR). You may also withdraw consent at any time where processing is based on consent, without affecting the lawfulness of prior processing.',
          'You may lodge a complaint with the competent supervisory authority (e.g. the Spanish Data Protection Agency or the authority in your country of residence). To exercise these rights or for any privacy enquiry, use the contact link on the site and clearly indicate the right you wish to exercise.',
        ],
      },
      {
        title: '9. Security',
        body: [
          'We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss, alteration or destruction. Passwords are stored in encrypted form. Communication with the site is carried out over a secure connection (HTTPS). We limit access to personal data to personnel who need it for the performance of their duties.',
          'In the event of a security incident that may affect your personal data, we will inform you and notify the supervisory authority when required by law.',
        ],
      },
      {
        title: '10. Changes to this policy',
        body: [
          'We may update this privacy policy. Changes will be published on this page with the date of last update. We recommend that you review it periodically. Continued use of the Service after publication of changes constitutes acceptance of the updated policy. If changes materially affect the processing of your data, we will inform you when required by law.',
        ],
      },
    ],
  },
};

export default function Privacidad() {
  const { lang } = useLanguage();
  const c = content[lang] || content.es;
  return (
    <LegalPageLayout
      title={c.title}
      subtitle={c.subtitle}
      lastUpdated={c.lastUpdated}
      sections={c.sections}
    />
  );
}
