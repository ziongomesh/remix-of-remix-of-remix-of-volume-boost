// Logger utilitário para notificações no terminal
// Cada ação no sistema gera uma notificação formatada

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

function timestamp(): string {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function line(char = '─', len = 60): string {
  return char.repeat(len);
}

export const logger = {
  // ========== AUTH ==========
  login(admin: { id: number; nome: string; email: string; rank: string }, ip: string) {
    console.log(`\n${colors.bgGreen}${colors.bright} ✅ LOGIN ${colors.reset}`);
    console.log(`${colors.green}${line()}${colors.reset}`);
    console.log(`  👤 ${colors.bright}${admin.nome}${colors.reset} (${admin.email})`);
    console.log(`  🏷️  Rank: ${colors.cyan}${admin.rank}${colors.reset} | ID: ${admin.id}`);
    console.log(`  🌐 IP: ${colors.yellow}${ip}${colors.reset}`);
    console.log(`  🕐 ${timestamp()}`);
    console.log(`${colors.green}${line()}${colors.reset}\n`);
  },

  loginFailed(email: string, ip: string, reason: string) {
    console.log(`\n${colors.bgRed}${colors.bright} ❌ LOGIN FALHOU ${colors.reset}`);
    console.log(`${colors.red}${line()}${colors.reset}`);
    console.log(`  📧 Email: ${email}`);
    console.log(`  🌐 IP: ${colors.yellow}${ip}${colors.reset}`);
    console.log(`  ❗ Motivo: ${reason}`);
    console.log(`  🕐 ${timestamp()}`);
    console.log(`${colors.red}${line()}${colors.reset}\n`);
  },

  sessionKicked(admin: { id: number; nome: string }, oldIp: string | null, newIp: string) {
    console.log(`\n${colors.bgYellow}${colors.bright} ⚠️  SESSÃO ANTERIOR ENCERRADA ${colors.reset}`);
    console.log(`${colors.yellow}${line()}${colors.reset}`);
    console.log(`  👤 ${admin.nome} (ID: ${admin.id})`);
    console.log(`  🌐 IP anterior: ${colors.dim}${oldIp || 'N/A'}${colors.reset}`);
    console.log(`  🌐 Novo IP: ${colors.bright}${newIp}${colors.reset}`);
    console.log(`  🕐 ${timestamp()}`);
    console.log(`${colors.yellow}${line()}${colors.reset}\n`);
  },

  logout(adminId: number, nome: string) {
    console.log(`\n${colors.bgMagenta}${colors.bright} 🚪 LOGOUT ${colors.reset}`);
    console.log(`  👤 ${nome} (ID: ${adminId}) | 🕐 ${timestamp()}\n`);
  },

  pinValidated(adminId: number, valid: boolean) {
    const icon = valid ? '✅' : '❌';
    console.log(`  ${icon} PIN ${valid ? 'válido' : 'inválido'} para admin ID: ${adminId} | 🕐 ${timestamp()}`);
  },

  sessionInvalid(adminId: number, ip: string) {
    console.log(`\n${colors.bgRed}${colors.bright} 🔒 SESSÃO INVÁLIDA ${colors.reset}`);
    console.log(`  👤 Admin ID: ${adminId} | 🌐 IP: ${ip} | 🕐 ${timestamp()}\n`);
  },

  // ========== CNH ==========
  cnhCreated(admin: { id: number; nome?: string }, cpf: string, nome: string) {
    console.log(`\n${colors.bgCyan}${colors.bright} 📄 CNH CRIADA ${colors.reset}`);
    console.log(`${colors.cyan}${line()}${colors.reset}`);
    console.log(`  👤 Admin: ${admin.nome || `ID ${admin.id}`}`);
    console.log(`  📋 Nome: ${colors.bright}${nome}${colors.reset}`);
    console.log(`  🔢 CPF: ${cpf}`);
    console.log(`  🕐 ${timestamp()}`);
    console.log(`${colors.cyan}${line()}${colors.reset}\n`);
  },

  cnhUpdated(adminId: number, usuarioId: number, nome: string, changed: string[]) {
    console.log(`\n${colors.bgBlue}${colors.bright} ✏️  CNH EDITADA ${colors.reset}`);
    console.log(`${colors.blue}${line()}${colors.reset}`);
    console.log(`  👤 Admin ID: ${adminId}`);
    console.log(`  📋 Usuário: ${nome} (ID: ${usuarioId})`);
    console.log(`  🔄 Matrizes alteradas: ${changed.length > 0 ? changed.join(', ') : 'nenhuma'}`);
    console.log(`  🕐 ${timestamp()}`);
    console.log(`${colors.blue}${line()}${colors.reset}\n`);
  },

  cnhListed(adminId: number, count: number) {
    console.log(`  📋 Listagem CNH: admin ${adminId} → ${count} registros | 🕐 ${timestamp()}`);
  },

  // ========== CRÉDITOS ==========
  creditTransfer(fromId: number, toId: number, amount: number) {
    console.log(`\n${colors.bgMagenta}${colors.bright} 💸 TRANSFERÊNCIA ${colors.reset}`);
    console.log(`${colors.magenta}${line()}${colors.reset}`);
    console.log(`  📤 De: Admin ${fromId}`);
    console.log(`  📥 Para: Admin ${toId}`);
    console.log(`  💰 Quantidade: ${colors.bright}${amount} créditos${colors.reset}`);
    console.log(`  🕐 ${timestamp()}`);
    console.log(`${colors.magenta}${line()}${colors.reset}\n`);
  },

  creditRecharge(adminId: number, amount: number, totalPrice: number) {
    console.log(`\n${colors.bgGreen}${colors.bright} 💳 RECARGA ${colors.reset}`);
    console.log(`${colors.green}${line()}${colors.reset}`);
    console.log(`  👤 Admin ID: ${adminId}`);
    console.log(`  💰 Créditos: ${colors.bright}${amount}${colors.reset}`);
    console.log(`  💵 Valor: R$ ${totalPrice?.toFixed(2) || '0.00'}`);
    console.log(`  🕐 ${timestamp()}`);
    console.log(`${colors.green}${line()}${colors.reset}\n`);
  },

  // ========== GERAL ==========
  action(type: string, details: string) {
    console.log(`  🔔 [${type}] ${details} | 🕐 ${timestamp()}`);
  },

  error(context: string, err: any) {
    console.log(`\n${colors.bgRed}${colors.bright} ❌ ERRO ${colors.reset}`);
    console.log(`  📍 ${context}`);
    console.log(`  💬 ${err?.message || err}`);
    console.log(`  🕐 ${timestamp()}\n`);
  },
};

export default logger;
