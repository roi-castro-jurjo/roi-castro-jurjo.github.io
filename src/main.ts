import './styles/main.css'
import { initializeI18n, bindDomTranslations } from './i18n'
import { Application } from './core/Application'

initializeI18n()
bindDomTranslations()

const application = new Application()
void application.start()
