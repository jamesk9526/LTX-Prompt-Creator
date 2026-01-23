; Custom NSIS definitions to add notes and an Ollama install link
!include "MUI2.nsh"

; Welcome page text
!define MUI_WELCOMEPAGE_TEXT "Welcome to LTX Prompter Setup.\r\n\r\nNote: Some features (AI-powered expansion) require Ollama. If you plan to use these, install Ollama after setup.\r\n\r\nThis application is open-source (MIT). For docs and source, visit the project repository."

; Finish page text with link to Ollama
!define MUI_FINISHPAGE_TEXT "Setup is complete.\r\n\r\nTip: To enable AI features, install Ollama and select a model in Settings.\r\n\r\nOpen-source: https://github.com/jamesk9526/LTX-Prompt-Creator"
!define MUI_FINISHPAGE_LINK "Install Ollama"
!define MUI_FINISHPAGE_LINK_LOCATION "https://ollama.com/"
