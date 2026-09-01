import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@davinoneves.com.br';
  const adminPassword = 'admin123';
  const adminNome = 'Administrador';

  console.log('🌱 [Davino Neves] Iniciando script de Seed do banco de dados...');

  // 1. Verificar se o usuário com este e-mail já existe
  const existingUser = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log(`⚠️  O usuário com o e-mail "${adminEmail}" já existe no banco (ID: ${existingUser.id_usuario}).`);
    console.log('🔄 Atualizando a senha para "admin123" e garantindo status ATIVO e perfil ADMINISTRADOR...');

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(adminPassword, salt);

    const updatedUser = await prisma.usuario.update({
      where: { email: adminEmail },
      data: {
        nome: adminNome,
        senha_hash,
        role: Role.ADMINISTRADOR,
        ativo: true,
      },
    });

    console.log(`✅ Usuário administrador pioneiro sincronizado com sucesso! ID: ${updatedUser.id_usuario}`);
  } else {
    console.log(`🔨 Criando usuário Administrador pioneiro (${adminEmail})...`);

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(adminPassword, salt);

    const novoAdmin = await prisma.usuario.create({
      data: {
        nome: adminNome,
        email: adminEmail,
        senha_hash,
        role: Role.ADMINISTRADOR,
        ativo: true,
      },
    });

    console.log(`🎉 Usuário Administrador pioneiro criado com sucesso!`);
    console.log(`   - ID: ${novoAdmin.id_usuario}`);
    console.log(`   - Nome: ${novoAdmin.nome}`);
    console.log(`   - E-mail: ${novoAdmin.email}`);
    console.log(`   - Role: ${novoAdmin.role}`);
    console.log(`   - Status: ${novoAdmin.ativo ? 'Ativo' : 'Inativo'}`);
  }

  console.log('✨ Seed finalizado com êxito!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
