# CI/CD & Deploy

Monorepo com dois apps com pipeline independente: `apps/api` (NestJS) e `apps/web` (React + Vite).

## Pipelines

`.github/workflows/backend.yml` e `.github/workflows/frontend.yml` rodam em todo push/PR pro
`main` que mexa no app correspondente (path-filtered, então mudar um app não dispara a pipeline
do outro). Cada uma tem 4 estágios, cada um só roda se o anterior passou:

1. **Lint**
2. **Test** — unitários e, na API, e2e também
3. **Build** — build de produção, sobe como artifact do workflow
4. **Deploy** — só em push pro `main`, e só se os secrets da AWS estiverem configurados (senão o
   job loga um aviso e pula, nunca quebra um PR)

## Infra (AWS, us-east-1)

Ambiente único, sem HA/redundância — feito pra durar uma apresentação, não produção.

| Recurso | Detalhe |
|---|---|
| Backend | EC2 `t3.micro` (`i-069ec02f00138618e`), roda a API via `systemd` (`gerenciador-api.service`), dados em memória (zeram se o processo reiniciar) |
| IP do backend | Elastic IP `32.196.188.126` — fixo mesmo se a instância reiniciar |
| Frontend | Bucket S3 `gerenciador-alunos-web-271123` com static website hosting |
| Deploy do backend | GitHub Actions manda um comando via **SSM Run Command** (sem SSH, sem chave como secret): `git pull && npm ci && npm run build && systemctl restart` |
| Deploy do frontend | GitHub Actions builda com `VITE_API_URL` e sincroniza o `dist/` pro bucket via `aws s3 sync` |

### Secrets/variáveis no GitHub (Settings → Secrets and variables → Actions)

**Secrets** (usuário IAM `gh-actions-gerenciador-alunos`, sem AdministratorAccess — só
`s3:PutObject/DeleteObject/ListBucket` no bucket e `ssm:SendCommand` na instância):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Variables** (não sensíveis):
- `AWS_REGION` = `us-east-1`
- `EC2_INSTANCE_ID` = `i-069ec02f00138618e`
- `S3_BUCKET` = `gerenciador-alunos-web-271123`
- `VITE_API_URL` = `http://32.196.188.126:3000`

## URLs

- Frontend: http://gerenciador-alunos-web-271123.s3-website-us-east-1.amazonaws.com
- Backend: http://32.196.188.126:3000

## Depois da apresentação

Pra não gerar custo à toa, derrubar os recursos:

```bash
aws ec2 terminate-instances --instance-ids i-069ec02f00138618e
aws ec2 release-address --allocation-id <alloc-id-do-elastic-ip>
aws s3 rb s3://gerenciador-alunos-web-271123 --force
aws iam delete-access-key --user-name gh-actions-gerenciador-alunos --access-key-id <key-id>
aws iam delete-user-policy --user-name gh-actions-gerenciador-alunos --policy-name deploy-policy
aws iam delete-user --user-name gh-actions-gerenciador-alunos
```

## Notas

- Sem HTTPS (nem no S3 nem no EC2) — não tem certificado configurado, é HTTP puro.
- `CORS_ORIGIN` do backend já está fixado pra URL do bucket S3 (definido no `systemd` unit em
  `/etc/systemd/system/gerenciador-api.service` na instância).
- Chave SSH `gerenciador-alunos-key` existe caso precise entrar na instância manualmente pra
  debugar; o deploy normal não usa SSH.
