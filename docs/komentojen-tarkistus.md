# Komentojen tarkistus virallisista lähteistä

Tarkistettu 2026-10-24. Komennot on kopioitu sanatarkasti virallisilta sivuilta. Tätä tiedostoa käytetään `src/content/commands.json`:n lähteenä. Kun päivität komentoa, päivitä myös `verifiedAt`.

| Asia | Komento | Lähde | Huomiot |
|---|---|---|---|
| PowerShell 7 (Win) | `winget install --id Microsoft.PowerShell --source winget` | https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows | WinGet on suositeltu tapa. Käynnistys: Käynnistä-valikon "PowerShell 7" tai `pwsh`. Ei "Windows PowerShell" (5.1). |
| PowerShell-versio | `$PSVersionTable` / `pwsh -Version` | https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pwsh | |
| Git (Win) | `winget install --id Git.Git -e --source winget` | https://git-scm.com/install/windows | Winget-paketti ei ole Git for Windows -projektin ylläpitämä. Ensisijainen tapa on asennusohjelma (.exe). |
| Git (Mac) | `xcode-select --install` (tai `brew install git`) | https://git-scm.com/install/mac | Ei enää binääriasennusohjelmaa. |
| VS Code (Win) | – (ladataan asennusohjelma) | https://code.visualstudio.com/docs/setup/windows | Virallinen sivu ei dokumentoi winget-komentoa. User setup lisää PATHiin. Käynnistä konsoli uudelleen, sitten `code .`. |
| VS Code (Mac) | – (lataa .dmg, vedä Applications-kansioon) | https://code.visualstudio.com/docs/setup/mac | Cmd+Shift+P → "Shell Command: Install 'code' and optionally 'copilot' commands in PATH" (vanha nimi "Shell Command: Install 'code' command in PATH"). |
| Kansio VS Codessa | `code .` | https://code.visualstudio.com/docs/setup/windows | |
| GitHub CLI (Win) | `winget install --id GitHub.cli --source winget` | https://github.com/cli/cli/blob/trunk/docs/install_windows.md | Windows Terminalissa avaa uusi ikkuna, uusi välilehti ei riitä. |
| GitHub CLI (Mac) | `brew install gh` | https://github.com/cli/cli/blob/trunk/docs/install_macos.md | Virallinen .pkg on https://github.com/cli/cli/releases/latest ("currently unsigned"). |
| gh kirjautuminen | `gh auth login` | https://cli.github.com/manual/gh_auth_login | Oletuksena selainkirjautuminen. |
| gh versio | `gh --version` | gh:n lähdekoodi | Lippu löytyy gh:n lähdekoodista, mutta ei manuaalisivulta. |
| Homebrew | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | https://brew.sh/ | |
| Claude Code (Mac) | `curl -fsSL https://claude.ai/install.sh \| bash` | https://code.claude.com/docs/en/setup | Avaa uusi terminaali-ikkuna asennuksen jälkeen. Vaatii macOS 13+. |
| Claude Code (Win) | `irm https://claude.ai/install.ps1 \| iex` | https://code.claude.com/docs/en/setup | Ei järjestelmänvalvojan oikeuksia. Git for Windows on suositeltu. Vaatii Windows 10 1809+. |
| Claude Code kirjautuminen | `claude` (+ selaimen ohjeet), `/login` | https://code.claude.com/docs/en/quickstart | |
| Claude Code -tarkistus | `claude --version`, `claude doctor` | https://code.claude.com/docs/en/setup | |
| Claude-tilaus | – | https://claude.com/pricing | "Claude Code requires a Pro, Max, Team, Enterprise, or Console account. The free claude.ai plan does not include Claude Code access." Hintoja ei sivulle. |
| Plan mode | Shift+Tab, `/plan`, `claude --permission-mode plan` | https://code.claude.com/docs/en/permission-modes | Kierto: default → acceptEdits → plan. |
| Komennot | `/init`, `/clear`, `/compact`, `/context`, `/memory` | https://code.claude.com/docs/en/commands | |
| GitHub-tili | – | https://github.com/signup | |
| 2FA | – | https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication | Ensisijainen tapa: TOTP-sovellus. |
| Repo + push | `gh repo create <nimi> --public --source=. --remote=origin --push` | https://cli.github.com/manual/gh_repo_create | Liput on tarkistettu manuaalista, mutta tätä yhdistelmää ei ole sivulla sellaisenaan. |
| Gitin ensiasetukset | `git config --global user.name "John Doe"`, `git config --global user.email johndoe@example.com` | https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup | |
| Suoritusoikeudet | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` | https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies | Ei vaadi järjestelmänvalvojaa. Tarkistus: `Get-ExecutionPolicy -List`. |
| Pages-actionit | checkout@v7, setup-node@v7, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5 | https://vite.dev/guide/static-deploy | Settings → Pages → Source: GitHub Actions. |
