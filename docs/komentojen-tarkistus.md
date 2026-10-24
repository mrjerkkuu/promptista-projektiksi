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

## Toinen tarkistuskierros (2026-10-24)

| Asia | Komento | Lähde | Huomiot |
|---|---|---|---|
| Git-versio | `git --version` | https://git-scm.com/docs/git | |
| git init | `git init` | https://git-scm.com/docs/git-init | |
| git status | `git status` | https://git-scm.com/docs/git-status | |
| git add | `git add -A` (`.` on tavallinen polku) | https://git-scm.com/docs/git-add | Sivulla ei ole valmista `git add .` -esimerkkiä. Käytetään `git add -A`:ta. |
| git commit | `git commit -m "<viesti>"` | https://git-scm.com/docs/git-commit | |
| git log | `git log --oneline` | https://git-scm.com/docs/git-log | |
| git restore | `git restore <tiedosto>` | https://git-scm.com/docs/git-restore | |
| git push | `git push` | https://git-scm.com/docs/git-push | |
| VS Code -versio | `code --version` | https://code.visualstudio.com/docs/configure/command-line | |
| VS Code: kansio | `code .`; valikko File > Open Folder... | https://code.visualstudio.com/docs/editing/workspaces/workspaces | |
| gh-versio | `gh --version` | https://cli.github.com/manual/gh | "Show gh version." |
| gh browse | `gh browse` | https://cli.github.com/manual/gh_browse | Avaa nykyisen repon kotisivun selaimessa. |
| PowerShell-aliakset | `cd`, `ls`, `dir`, `pwd` | https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_aliases | |
| mkdir (PowerShell) | `mkdir` | https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_built-in_functions | Funktio, joka ajaa `New-Item -Type Directory`. |
| Tiedoston avaus (Win) | `Invoke-Item index.html` | https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/invoke-item | Avaa tiedoston oletusohjelmassa. Alias `ii`. |
| Päätteen avaus (Mac) | Spotlight → "Terminal" / Apit > Lisäohjelmat | https://support.apple.com/guide/terminal/open-or-quit-terminal-apd5265185d-f365-44cb-8b09-71a064a42125/mac | |
| Tiedoston avaus (Mac) | `open index.html` | EI VIRALLISTA LÄHDETTÄ | Applen sivu näyttää vain `open -a MyProg.app`. Merkitty TODO:ksi. |
| GitHub Pages | Settings → Pages → Deploy from a branch → main, / (root) → Save | https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site | Ilmainen julkisissa repoissa. Osoite muotoa `https://<käyttäjä>.github.io/<repo>/`. |
| Claude Code: lopetus | `/exit`, Ctrl+C kahdesti, Ctrl+D kahdesti | https://code.claude.com/docs/en/interactive-mode | |
| Claude Code: keskeytys | Esc | https://code.claude.com/docs/en/interactive-mode | |
| Claude Code: kelaus | `/rewind` tai Esc Esc | https://code.claude.com/docs/en/checkpointing | Ei korvaa versionhallintaa. Bash-komentojen muuttamia tiedostoja ei seurata. |
| Claude Code: luvat | "Yes, and don't ask again", `/permissions` | https://code.claude.com/docs/en/permissions | Read-estosääntö esim. `Read(./.env)`. `.claudeignore`:lla ei ole vaikutusta. |
| CLAUDE.md | `/init` | https://code.claude.com/docs/en/memory | |
| Turvallisuus | – | https://code.claude.com/docs/en/security | |
| gitignore | – | https://git-scm.com/docs/gitignore, https://docs.github.com/en/get-started/git-basics/ignoring-files | |
| Tilaus | – | https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan | |
