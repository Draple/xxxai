import { useLanguage } from '../context/LanguageContext';
import LegalPageLayout from '../components/LegalPageLayout';

const content = {
  es: {
    title: 'Términos y condiciones',
    subtitle: 'Condiciones generales del contrato de uso de XXXAI',
    lastUpdated: 'Última actualización: Febrero 2025',
    sections: [
      {
        title: '1. Objeto y aceptación',
        body: [
          'Los presentes Términos y Condiciones («T&C») regulan el contrato entre el titular del servicio XXXAI («nosotros», «el Titular» o «el Servicio») y tú («usuario», «tu») en relación con el acceso y uso del sitio web y del servicio XXXAI, una plataforma de generación de video con inteligencia artificial orientada a contenido para adultos.',
          'Al registrarte, suscribirte o utilizar el Servicio, aceptas íntegramente estos T&C. Si no aceptas estas condiciones, no debes utilizar el Servicio. El uso continuado del Servicio tras cualquier modificación de los T&C constituye la aceptación de los nuevos términos.',
        ],
      },
      {
        title: '2. Definiciones',
        body: [
          '«Servicio»: el sitio web XXXAI y todas las funcionalidades ofrecidas (generación de video con IA, cuenta de usuario, compra de créditos, etc.).',
          '«Contenido generado»: cualquier video, imagen o material creado por el usuario mediante las herramientas del Servicio.',
          '«Créditos»: unidades de consumo que permiten usar las funcionalidades del Servicio; se compran en la página de checkout.',
          '«Cuenta»: el perfil de usuario asociado a un correo electrónico y/o a un proveedor de identidad externo (Google, Apple, etc.).',
        ],
      },
      {
        title: '3. Requisitos de edad y capacidad',
        body: [
          'El Servicio está destinado exclusivamente a personas mayores de 18 años (o la edad legal aplicable en tu jurisdicción para contenido para adultos). Al registrarte, declaras y garantizas que cumples este requisito y que tienes capacidad legal para aceptar estos T&C.',
          'Nos reservamos el derecho de verificar la edad y de denegar o cancelar el acceso en caso de incumplimiento. La falsedad en la declaración de edad puede dar lugar a la resolución inmediata del contrato y a la cancelación de la cuenta sin derecho a reembolso.',
        ],
      },
      {
        title: '4. Cuenta de usuario',
        body: [
          'Para utilizar el Servicio debes crear una cuenta proporcionando datos veraces y actualizados. Eres responsable de mantener la confidencialidad de tus credenciales y de toda la actividad que se realice bajo tu cuenta.',
          'Debes notificarnos de inmediato cualquier uso no autorizado de tu cuenta. No somos responsables de las pérdidas o daños derivados del uso no autorizado de tu cuenta por terceros.',
          'Nos reservamos el derecho de suspender o cerrar cuentas que incumplan estos T&C, que utilicen datos falsos o que, a nuestro juicio, representen un riesgo para el Servicio o para otros usuarios.',
        ],
      },
      {
        title: '5. Créditos y facturación',
        body: [
          'El acceso a las funcionalidades del Servicio requiere créditos. Los precios y los packs de créditos se muestran en la página de checkout. No hay renovaciones automáticas: compras créditos cuando los necesites.',
          'Los precios se indican en la moneda aplicable e incluyen los impuestos que correspondan según la legislación vigente, salvo indicación en contrario.',
          'Nos reservamos el derecho de modificar los precios con carácter previo. Las compras ya realizadas no se ven afectadas por cambios de precio posteriores.',
        ],
      },
      {
        title: '6. Reembolsos',
        body: [
          'No se realizan reembolsos por créditos ya comprados o consumidos, salvo que la legislación aplicable te reconozca un derecho de desistimiento o que exista un error imputable al Servicio. En caso de reembolso aplicable, se procederá según la normativa vigente.',
          'Si incumples estos T&C, nos reservamos el derecho de dar por terminada tu cuenta sin obligación de reembolso.',
        ],
      },
      {
        title: '7. Uso aceptable y prohibiciones',
        body: [
          'Debes utilizar el Servicio de forma lícita, respetando la legislación aplicable y los derechos de terceros. Queda expresamente prohibido: (a) generar, solicitar, almacenar o distribuir contenido ilegal (incluyendo contenido que represente o promueva abusos a menores, violencia no consentida, o que atente contra la dignidad de las personas); (b) infringir derechos de propiedad intelectual o industrial de terceros; (c) utilizar el Servicio para acosar, suplantar identidad o realizar actividades fraudulentas; (d) intentar acceder sin autorización a sistemas, redes o datos del Servicio o de otros usuarios; (e) utilizar bots, scripts o medios automatizados no autorizados para acceder o usar el Servicio.',
          'El incumplimiento de estas obligaciones puede dar lugar a la suspensión o cancelación inmediata de tu cuenta, a la retirada del contenido y, en su caso, a la comunicación a las autoridades competentes.',
        ],
      },
      {
        title: '8. Contenido generado y propiedad intelectual',
        body: [
          'XXXAI y todos los elementos del sitio (marca, diseño, software, textos, bases de datos) son propiedad del Titular o de sus licenciantes y están protegidos por la legislación de propiedad intelectual e industrial. No se te concede ninguna cesión de derechos sobre el Servicio más allá del uso autorizado en estos T&C.',
          'El contenido que generes mediante el Servicio («Contenido generado») es solo para uso propio (personal); no está autorizado el uso externo, la distribución ni la explotación fuera de la plataforma. El contenido generado sigue siendo de XXXAI (del Titular); no se te transfiere la propiedad intelectual sobre los videos o materiales creados con el Servicio.',
          'Eres responsable de que el uso que hagas del Servicio y del Contenido generado no infrinja derechos de terceros ni la ley. No asumimos responsabilidad por el Contenido generado por los usuarios. No está permitido publicar, monetizar ni explotar comercialmente los videos o materiales generados.',
        ],
      },
      {
        title: '9. Prestación del Servicio y disponibilidad',
        body: [
          'El Servicio se presta «tal cual» y «según disponibilidad». No garantizamos la disponibilidad ininterrumpida ni la ausencia de errores. Podemos realizar labores de mantenimiento, actualizaciones o modificaciones que impliquen interrupciones temporales, siempre que sea razonable.',
          'Nos reservamos el derecho de modificar, limitar o discontinuar funcionalidades del Servicio, previo aviso cuando la normativa lo exija o cuando sea razonable. En caso de discontinuación sustancial del Servicio, se aplicará la política de reembolsos que en su momento esté publicada.',
        ],
      },
      {
        title: '10. Limitación de responsabilidad',
        body: [
          'En la medida permitida por la ley, no seremos responsables por daños indirectos, consecuentes, especiales, punitivos o lucro cesante derivados del uso o la imposibilidad de uso del Servicio, incluyendo pero no limitado a: pérdida de datos, pérdida de beneficios, interrupción del negocio o daños derivados del Contenido generado por ti o por terceros.',
          'Nuestra responsabilidad total frente a ti por cualquier reclamación derivada de estos T&C o del uso del Servicio no excederá del importe que hayas pagado al Titular en los doce (12) meses anteriores a la reclamación, o, si no hubiera pago, no excederá de cien (100) euros o el equivalente en la moneda aplicable.',
        ],
      },
      {
        title: '11. Indemnización',
        body: [
          'Te comprometes a indemnizar y eximir de responsabilidad al Titular, sus afiliados, directivos, empleados y licenciantes frente a cualquier reclamación, daño, pérdida, coste (incluyendo honorarios legales razonables) que surjan de: (a) tu uso del Servicio; (b) tu incumplimiento de estos T&C; (c) el Contenido que generes o que subas; (d) la infracción de derechos de terceros o de la ley. Esta obligación permanecerá vigente tras la finalización de tu relación con el Servicio.',
        ],
      },
      {
        title: '12. Resolución y efectos',
        body: [
          'Puedes dar por terminado el contrato en cualquier momento dejando de usar el Servicio y, si lo deseas, solicitando el cierre de tu cuenta. Nosotros podemos suspender o dar por terminado tu acceso y tu cuenta en caso de incumplimiento de estos T&C, por motivos legales o por decisión empresarial razonable, con o sin previo aviso cuando la ley lo permita.',
          'Tras la resolución, tu derecho a usar el Servicio cesará de inmediato. Las disposiciones de estos T&C que por su naturaleza deban sobrevivir (limitación de responsabilidad, indemnización, ley aplicable, etc.) permanecerán en vigor tras la resolución.',
        ],
      },
      {
        title: '13. Ley aplicable y jurisdicción',
        body: [
          'Estos T&C se rigen por la legislación aplicable en el territorio del Titular. Para la resolución de cualquier controversia que pudiera surgir en relación con estos T&C o con el uso del Servicio, las partes se someten a los juzgados y tribunales que correspondan conforme a la ley, sin perjuicio de los derechos que pudieran asistirte como consumidor según la legislación de tu país de residencia.',
        ],
      },
      {
        title: '14. Modificaciones',
        body: [
          'Podemos modificar estos T&C en cualquier momento. Los cambios serán efectivos desde su publicación en esta página, con indicación de la fecha de última actualización. En caso de cambios sustanciales, te notificaremos cuando la normativa lo exija o cuando sea razonable (por ejemplo, por correo electrónico o aviso en el sitio).',
          'El uso continuado del Servicio tras la entrada en vigor de las modificaciones constituye la aceptación de los nuevos T&C. Si no aceptas los cambios, debes dejar de utilizar el Servicio.',
        ],
      },
      {
        title: '15. Disposiciones generales',
        body: [
          'Si alguna disposición de estos T&C fuera declarada nula o inaplicable, las demás disposiciones mantendrán su pleno vigor. La no exigencia del cumplimiento estricto de alguna disposición no constituirá renuncia a exigirlo en el futuro.',
          'Estos T&C constituyen el acuerdo completo entre tú y el Titular respecto al Servicio y sustituyen a cualquier acuerdo o comunicación previa. Las traducciones de estos T&C se facilitan por comodidad; en caso de conflicto, prevalecerá la versión en el idioma oficial del Titular.',
        ],
      },
      {
        title: '16. Contacto',
        body: [
          'Para cualquier cuestión relacionada con estos Términos y Condiciones puedes contactarnos a través del enlace de contacto indicado en el sitio.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms and conditions',
    subtitle: 'General conditions of the XXXAI service agreement',
    lastUpdated: 'Last updated: February 2025',
    sections: [
      {
        title: '1. Purpose and acceptance',
        body: [
          'These Terms and Conditions («T&C») govern the contract between the owner of the XXXAI service («we», «the Owner» or «the Service») and you («user», «you») in relation to access to and use of the XXXAI website and service, an adult-oriented AI video generation platform.',
          'By registering, subscribing or using the Service, you accept these T&C in full. If you do not accept these conditions, you must not use the Service. Continued use of the Service after any modification to the T&C constitutes acceptance of the new terms.',
        ],
      },
      {
        title: '2. Definitions',
        body: [
          '«Service»: the XXXAI website and all functionalities offered (AI video generation, user account, credit purchases, etc.).',
          '«Generated content»: any video, image or material created by the user through the Service tools.',
          '«Credits»: consumption units that allow you to use the Service features; they are purchased on the checkout page.',
          '«Account»: the user profile associated with an email address and/or an external identity provider (Google, Apple, etc.).',
        ],
      },
      {
        title: '3. Age and capacity requirements',
        body: [
          'The Service is intended exclusively for persons over 18 years of age (or the applicable legal age in your jurisdiction for adult content). By registering, you represent and warrant that you meet this requirement and have the legal capacity to accept these T&C.',
          'We reserve the right to verify age and to deny or cancel access in case of non-compliance. Misrepresentation of age may result in immediate termination of the contract and cancellation of the account without right to refund.',
        ],
      },
      {
        title: '4. User account',
        body: [
          'To use the Service you must create an account by providing accurate and up-to-date information. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.',
          'You must notify us immediately of any unauthorised use of your account. We are not responsible for any loss or damage arising from unauthorised use of your account by third parties.',
          'We reserve the right to suspend or close accounts that breach these T&C, that use false data or that, in our opinion, represent a risk to the Service or to other users.',
        ],
      },
      {
        title: '5. Credits and billing',
        body: [
          'Access to the Service features requires credits. Prices and credit packs are displayed on the checkout page. There are no automatic renewals: you buy credits when you need them.',
          'Prices are indicated in the applicable currency and include applicable taxes in accordance with current legislation, unless otherwise indicated.',
          'We reserve the right to modify prices in advance. Purchases already made are not affected by subsequent price changes.',
        ],
      },
      {
        title: '6. Refunds',
        body: [
          'No refunds are made for credits already purchased or used, unless applicable legislation grants you a right of withdrawal or there is an error attributable to the Service. Where a refund applies, it will be processed in accordance with applicable law.',
          'If you breach these T&C, we reserve the right to terminate your account without any obligation to refund.',
        ],
      },
      {
        title: '7. Acceptable use and prohibitions',
        body: [
          'You must use the Service lawfully, in compliance with applicable legislation and the rights of third parties. The following are expressly prohibited: (a) generating, requesting, storing or distributing illegal content (including content that depicts or promotes abuse of minors, non-consensual violence, or that violates the dignity of persons); (b) infringing the intellectual or industrial property rights of third parties; (c) using the Service to harass, impersonate or carry out fraudulent activities; (d) attempting to gain unauthorised access to the Service\'s or other users\' systems, networks or data; (e) using bots, scripts or unauthorised automated means to access or use the Service.',
          'Breach of these obligations may result in immediate suspension or cancellation of your account, removal of content and, where appropriate, reporting to the competent authorities.',
        ],
      },
      {
        title: '8. Generated content and intellectual property',
        body: [
          'XXXAI and all elements of the site (brand, design, software, texts, databases) are the property of the Owner or its licensors and are protected by intellectual and industrial property legislation. No transfer of rights over the Service is granted to you beyond the authorised use under these T&C.',
          'Content you generate through the Service («Generated content») is for your own (personal) use only; external use, distribution or exploitation outside the platform is not permitted. The generated content remains the property of XXXAI (the Owner); no intellectual property rights in the videos or materials created with the Service are transferred to you.',
          'You are responsible for ensuring that your use of the Service and Generated content does not infringe third party rights or the law. We assume no responsibility for content generated by users. You may not publish, monetise or commercially exploit the generated videos or materials.',
        ],
      },
      {
        title: '9. Provision of the Service and availability',
        body: [
          'The Service is provided «as is» and «as available». We do not guarantee uninterrupted availability or the absence of errors. We may carry out maintenance, updates or modifications that involve temporary interruptions, where reasonable.',
          'We reserve the right to modify, limit or discontinue features of the Service, with notice when required by law or when reasonable. In the event of substantial discontinuation of the Service, the refund policy published at that time will apply.',
        ],
      },
      {
        title: '10. Limitation of liability',
        body: [
          'To the extent permitted by law, we shall not be liable for indirect, consequential, special, punitive or lost profit damages arising from the use or inability to use the Service, including but not limited to: loss of data, loss of profits, business interruption or damages arising from content generated by you or by third parties.',
          'Our total liability to you for any claim arising from these T&C or the use of the Service shall not exceed the amount you have paid to the Owner in the twelve (12) months preceding the claim, or, if no payment has been made, one hundred (100) euros or the equivalent in the applicable currency.',
        ],
      },
      {
        title: '11. Indemnity',
        body: [
          'You agree to indemnify and hold harmless the Owner, its affiliates, officers, employees and licensors from any claim, damage, loss, cost (including reasonable legal fees) arising from: (a) your use of the Service; (b) your breach of these T&C; (c) content you generate or upload; (d) infringement of third party rights or the law. This obligation shall survive the termination of your relationship with the Service.',
        ],
      },
      {
        title: '12. Termination and effects',
        body: [
          'You may terminate the contract at any time by ceasing to use the Service and, if you wish, requesting closure of your account. We may suspend or terminate your access and your account in the event of breach of these T&C, for legal reasons or for reasonable business reasons, with or without prior notice when permitted by law.',
          'Upon termination, your right to use the Service shall cease immediately. Provisions of these T&C that by their nature should survive (limitation of liability, indemnity, governing law, etc.) shall remain in effect after termination.',
        ],
      },
      {
        title: '13. Governing law and jurisdiction',
        body: [
          'These T&C are governed by the applicable law in the Owner\'s territory. For the resolution of any dispute that may arise in relation to these T&C or the use of the Service, the parties submit to the courts and tribunals that correspond in accordance with the law, without prejudice to any rights you may have as a consumer under the legislation of your country of residence.',
        ],
      },
      {
        title: '14. Modifications',
        body: [
          'We may modify these T&C at any time. Changes will be effective upon publication on this page, with the date of last update. In the event of substantial changes, we will notify you when required by law or when reasonable (e.g. by email or notice on the site).',
          'Continued use of the Service after the modifications take effect constitutes acceptance of the new T&C. If you do not accept the changes, you must stop using the Service.',
        ],
      },
      {
        title: '15. General provisions',
        body: [
          'If any provision of these T&C is declared null or unenforceable, the remaining provisions shall remain in full force. Failure to enforce strict compliance with any provision shall not constitute a waiver of the right to enforce it in the future.',
          'These T&C constitute the entire agreement between you and the Owner regarding the Service and supersede any prior agreement or communication. Translations of these T&C are provided for convenience; in case of conflict, the version in the Owner\'s official language shall prevail.',
        ],
      },
      {
        title: '16. Contact',
        body: [
          'For any questions regarding these Terms and Conditions you may contact us through the contact link indicated on the site.',
        ],
      },
    ],
  },
};

export default function Terminos() {
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
