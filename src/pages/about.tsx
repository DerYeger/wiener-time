import { NextPage } from 'next'
import Head from 'next/head'
import Header from '../components/Header'
import Nav from '../components/Nav'

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About — WienerTime</title>
        <meta
          name='description'
          content='Real-time traffic data of Wiener Linien monitors.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='min-h-screen pb-[50px] flex flex-col'>
        <Header />
        <main className='flex-1 flex flex-col md:flex-row md:justify-center items-center md:items-start px-4 mt-4 gap-8 md:gap-16'>
          <section className='flex flex-col gap-4'>
            <h2 className='text-3xl font-bold'>Impressum</h2>
            <div className='flex flex-col gap-2'>
              <p>
                Informationspflicht laut §5 E-Commerce Gesetz und
                Offenlegungspflicht laut §25 Mediengesetz
              </p>
              <p>Jan Müller</p>
              <div>
                <p>Seegasse 10</p>
                <p>1090 Wien</p>
                <p>Österreich</p>
              </div>
              <p>Tel: +43 (0)660/9298309</p>
              <p>
                E-Mail:{' '}
                <a href='mailto:mail%40jan-mueller.at'>mail@jan-mueller.at</a>{' '}
              </p>
            </div>

            <div id='email_kooperatioen'>
              <h2 className='text-2xl'>
                Erlaubnis für unaufgeforderte Zusendungen
              </h2>
              <p>
                Sie haben die temporäre Erlaubnis uns unaufgeforderte Zusendung
                in Form von Werbung Ihrer Produkte, Kooperationsanfragen oder
                Partnerschaftsanfragen zuzusenden. Dafür wurde ein eigenes
                E-Mail Postfach eingerichtet, welches Sie unter{' '}
                <a href='mailto:mail%40jan-mueller.at'>mail@jan-mueller.at</a>{' '}
                erreichen können. Mit diesem Postfach ist eine temporäre
                Einwilligung des Empfängers zur Zusendung von
                Informationsmaterial bis auf Widerruf gestattet. Ein etwaiger
                Widerruf hat zur Folge, dass keine weiteren Zusendungen oder
                Kontaktaufnahmen ab dem Zeitpunkt der Bekanntgabe erfolgen
                dürfen.
              </p>
            </div>

            <div id='haftung_links'>
              <h2 className='text-2xl'>
                Haftungsausschluss für ausgehende Links
              </h2>
              <p>
                Diese Webpräsenz enthält, so wie viele andere Webseiten
                ebenfalls, so genannte Links auf andere, fremde Webpräsenzen und
                Inhalte. Das wird als Urgedanke des Internets und des weltweiten
                Informationsaustauschs als gang und gäbe angesehen. Rechtlich
                und technisch gesehen haben wir als Betreiber unserer Webseite
                keinen Einfluss auf die Gestaltung sowie den Inhalt der
                verlinkten Webpräsenzen. Aus diesem Grund können wir zu keinem
                Zeitpunkt für diese Webpräsenzen in irgendeiner Art und Weise
                Haftung oder Gewähr übernehmen, da diese im
                Verantwortungsbereich des jeweiligen Betreibers angesiedelt ist.
              </p>
              <p>
                Zum Zeitpunkt der Verlinkung wurden die fremden Inhalte auf
                Funktionalität, rechtswidrige Inhalte sowie uns möglich auf
                Schadsoftware überprüft. Als Indiz finden Sie bei einigen Links
                einen Datumsstempel der auf den Zeitpunkt der gesetzten
                Verlinkung hinweist. Nichts desto trotz sind wir bemüht unsere
                Besucher vor rechtswidrigen Inhalten und Schadsoftware zu
                schützen weshalb wir stichprobenartig die gesetzten Links in
                wiederkehrenden Intervallen untersuchen. Bei etwaigen
                Rechtsverletzungen werden die gesetzten Links selbstverständlich
                umgehend entfernt.
              </p>
              <p>
                Sollten Sie einen derartigen Link vor unserer Überprüfung
                gefunden haben, so bitten wir um umgehende Benachrichtigung an
                die im Impressum angezeigten Kontaktdaten. Bitte übermitteln Sie
                uns dabei den Link unserer Webseite die den fragwürdigen Verweis
                enthält, sowie die Art der Kennzeichnung (a) rechtwidriger
                Inhalt, b) Schadsoftware oder c) inaktiver Inhalt bzw. Verweis).
              </p>
            </div>

            <div id='ihre_rechte'>
              <h2 className='text-2xl'>Ihre Rechte</h2>
              <p>
                Ihnen stehen bezüglich Ihrer bei uns gespeicherten Daten
                grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung,
                Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch
                zu. Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen
                das Datenschutzrecht verstößt oder Ihre datenschutzrechtlichen
                Ansprüche sonst in einer Weise verletzt worden sind, können Sie
                sich bei der oben genannten E-Mail-Adresse oder Ihrer
                Datenschutzbehörde beschweren.
              </p>
            </div>

            <div id='erstelltmit'>
              <p>
                <small>
                  Generiert mit dem kostenlosen und einfachen{' '}
                  <a
                    href='https://idigit.onl/'
                    target='_blank'
                    rel='noreferrer'
                  >
                    Impressum Generator von idigIT e.U.
                  </a>
                </small>
              </p>
            </div>
          </section>
        </main>
        <Nav />
      </div>
    </>
  )
}

export default AboutPage
