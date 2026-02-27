import { useLanguage } from '../context/LanguageContext';
import LegalPageLayout from '../components/LegalPageLayout';

const content = {
  es: {
    title: 'Aviso legal',
    subtitle: 'Identificación del titular y marco jurídico de XXXAI',
    lastUpdated: 'Última actualización: Febrero 2025',
    sections: [
      {
        title: '1. Identificación del titular',
        body: [
          'El presente sitio web y el servicio XXXAI («el Servicio») son operados por el titular del servicio XXXAI (en adelante, «el Titular» o «nosotros»).',
          'Para cualquier comunicación relacionada con el aviso legal, el ejercicio de derechos o reclamaciones, puedes dirigirte al Titular a través del formulario o enlace de contacto disponible en el sitio. El Titular se compromete a atender las solicitudes en los plazos legalmente establecidos.',
        ],
      },
      {
        title: '2. Objeto y ámbito',
        body: [
          'Este aviso legal regula el acceso y el uso del sitio web y del Servicio XXXAI, una plataforma de generación de video con inteligencia artificial orientada a contenido para adultos. El acceso y la utilización del Servicio implican la aceptación íntegra del presente aviso legal y de los términos y condiciones publicados en la sección correspondiente.',
          'Si no aceptas estas condiciones, no debes utilizar el Servicio. El uso del sitio y del Servicio queda sometido a la legislación aplicable en el territorio desde el que accedas.',
        ],
      },
      {
        title: '3. Condiciones de acceso y uso general',
        body: [
          'El Servicio está destinado exclusivamente a personas mayores de 18 años (o la edad legal aplicable en tu jurisdicción). Al registrarte, declaras ser mayor de edad y tener capacidad legal para aceptar estos términos. Nos reservamos el derecho de verificar la edad y de denegar o cancelar el acceso en caso de incumplimiento.',
          'Debes utilizar el Servicio de forma lícita, respetando la legislación aplicable y los derechos de terceros. Queda prohibido generar, solicitar o distribuir contenido ilegal, que infrinja derechos de propiedad intelectual o que atente contra la dignidad de las personas. Nos reservamos el derecho de suspender o cancelar cuentas que incurran en un uso indebido.',
        ],
      },
      {
        title: '4. Propiedad intelectual e industrial',
        body: [
          'XXXAI, el sitio web y todos los elementos que lo integran (marca, logotipo, diseño, software, textos, gráficos, bases de datos, etc.) son propiedad del Titular o de sus licenciantes y están protegidos por la legislación en materia de propiedad intelectual e industrial.',
          'Los contenidos generados por los usuarios mediante el Servicio pueden estar sujetos a condiciones específicas que se indican en la plataforma. No se concede ninguna cesión de derechos sobre el Servicio más allá del uso autorizado en los términos y condiciones.',
        ],
      },
      {
        title: '5. Cookies y tecnologías similares',
        body: [
          'El sitio puede utilizar cookies y tecnologías similares para el correcto funcionamiento del Servicio, la autenticación, la preferencia de idioma y, en su caso, análisis de uso. La información detallada sobre las cookies utilizadas, su finalidad y la forma de gestionarlas se encuentra en la Política de privacidad.',
        ],
      },
      {
        title: '6. Enlaces a terceros',
        body: [
          'El sitio puede incluir enlaces a sitios web de terceros. El Titular no controla ni asume responsabilidad por el contenido, las políticas de privacidad o las prácticas de esos sitios. El acceso a enlaces externos es bajo tu propia responsabilidad.',
        ],
      },
      {
        title: '7. Limitación de responsabilidad',
        body: [
          'El Servicio se presta «tal cual». No garantizamos la disponibilidad ininterrumpida ni la ausencia de errores. En la medida permitida por la ley, no seremos responsables por daños indirectos, consecuentes o lucro cesante derivados del uso o la imposibilidad de uso del Servicio.',
          'El Titular no será responsable del uso indebido que los usuarios hagan del contenido generado ni de las consecuencias derivadas del incumplimiento por parte del usuario de las obligaciones legales o contractuales.',
        ],
      },
      {
        title: '8. Legislación aplicable y jurisdicción',
        body: [
          'El presente aviso legal se rige por la legislación aplicable en el territorio del Titular. Para la resolución de cualquier controversia que pudiera surgir en relación con el acceso o el uso del sitio y del Servicio, las partes se someten a los juzgados y tribunales que correspondan conforme a la ley.',
        ],
      },
      {
        title: '9. Modificaciones',
        body: [
          'Podemos modificar este aviso legal en cualquier momento. Los cambios serán efectivos desde su publicación en esta página. El uso continuado del Servicio tras la modificación constituye la aceptación de los nuevos términos. Te recomendamos revisar esta página periódicamente.',
        ],
      },
      {
        title: '10. Contacto',
        body: [
          'Para cualquier cuestión relacionada con este aviso legal puedes contactarnos a través del enlace de contacto indicado en el sitio.',
        ],
      },
    ],
  },
  en: {
    title: 'Legal notice',
    subtitle: 'Identification of the owner and legal framework of XXXAI',
    lastUpdated: 'Last updated: February 2025',
    sections: [
      {
        title: '1. Identification of the owner',
        body: [
          'This website and the XXXAI service («the Service») are operated by the owner of the XXXAI service (hereinafter, «the Owner» or «we»).',
          'For any communication relating to this legal notice, the exercise of rights or claims, you may contact the Owner through the form or contact link available on the site. The Owner undertakes to respond to requests within the legally established time limits.',
        ],
      },
      {
        title: '2. Purpose and scope',
        body: [
          'This legal notice governs access to and use of the XXXAI website and Service, an adult-oriented AI video generation platform. Access to and use of the Service constitutes full acceptance of this legal notice and of the terms and conditions published in the corresponding section.',
          'If you do not accept these conditions, you must not use the Service. Use of the site and the Service is subject to the applicable legislation in the territory from which you access it.',
        ],
      },
      {
        title: '3. Access and general use conditions',
        body: [
          'The Service is intended exclusively for persons over 18 years of age (or the applicable legal age in your jurisdiction). By registering, you declare that you are of legal age and have the legal capacity to accept these terms. We reserve the right to verify age and to deny or cancel access in case of non-compliance.',
          'You must use the Service lawfully, in compliance with applicable legislation and the rights of third parties. It is prohibited to generate, request or distribute illegal content, content that infringes intellectual property rights or that violates the dignity of persons. We reserve the right to suspend or cancel accounts that engage in misuse.',
        ],
      },
      {
        title: '4. Intellectual and industrial property',
        body: [
          'XXXAI, the website and all elements that comprise it (brand, logo, design, software, texts, graphics, databases, etc.) are the property of the Owner or its licensors and are protected by intellectual and industrial property legislation.',
          'Content generated by users through the Service may be subject to specific conditions indicated on the platform. No transfer of rights over the Service is granted beyond the authorised use set out in the terms and conditions.',
        ],
      },
      {
        title: '5. Cookies and similar technologies',
        body: [
          'The site may use cookies and similar technologies for the proper functioning of the Service, authentication, language preference and, where applicable, usage analytics. Detailed information on the cookies used, their purpose and how to manage them is set out in the Privacy Policy.',
        ],
      },
      {
        title: '6. Third-party links',
        body: [
          'The site may include links to third-party websites. The Owner does not control and is not responsible for the content, privacy policies or practices of those sites. Access to external links is at your own risk.',
        ],
      },
      {
        title: '7. Limitation of liability',
        body: [
          'The Service is provided «as is». We do not guarantee uninterrupted availability or the absence of errors. To the extent permitted by law, we shall not be liable for indirect, consequential or lost profit damages arising from the use or inability to use the Service.',
          'The Owner shall not be liable for misuse of generated content by users or for consequences arising from the user\'s breach of legal or contractual obligations.',
        ],
      },
      {
        title: '8. Applicable law and jurisdiction',
        body: [
          'This legal notice is governed by the applicable law in the Owner\'s territory. For the resolution of any dispute that may arise in relation to access to or use of the site and the Service, the parties submit to the courts and tribunals that correspond in accordance with the law.',
        ],
      },
      {
        title: '9. Modifications',
        body: [
          'We may modify this legal notice at any time. Changes will be effective upon publication on this page. Continued use of the Service after modification constitutes acceptance of the new terms. We recommend that you review this page periodically.',
        ],
      },
      {
        title: '10. Contact',
        body: [
          'For any questions regarding this legal notice you may contact us through the contact link indicated on the site.',
        ],
      },
    ],
  },
};

export default function Legal() {
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
