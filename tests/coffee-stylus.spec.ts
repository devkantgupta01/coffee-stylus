import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { CoffeeStylus } from '../target/types/coffee_stylus';
import { assert } from 'chai';

describe('coffee-stylus', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CoffeeStylus as Program<CoffeeStylus>;

  it('Initializes a new coffee listing', async () => {
    // Generate a new keypair for the coffee account
    const coffeeAccount = anchor.web3.Keypair.generate();
    
    // Test data
    const testCoffee = {
      name: "Ethiopian Yirgacheffe",
      origin: "Ethiopia",
      price: 1000000, // 1 SOL in lamports
      roastLevel: 3,
    };

    // Execute the RPC
    await program.rpc.initialize(
      testCoffee.name,
      testCoffee.origin,
      testCoffee.price,
      testCoffee.roastLevel,
      {
        accounts: {
          coffeeAccount: coffeeAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [coffeeAccount],
      }
    );

    // Fetch the created account
    const account = await program.account.coffeeAccount.fetch(coffeeAccount.publicKey);

    // Verify the account data
    assert.equal(account.name, testCoffee.name);
    assert.equal(account.origin, testCoffee.origin);
    assert.equal(account.price, testCoffee.price);
    assert.equal(account.roastLevel, testCoffee.roastLevel);
    assert.isTrue(account.available);
  });

  it('Allows purchasing coffee', async () => {
    const coffeeAccount = anchor.web3.Keypair.generate();
    const buyer = anchor.web3.Keypair.generate();
    
    // Airdrop SOL to buyer (only works in local validator)
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        buyer.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    // Initialize test coffee
    await program.rpc.initialize(
      "Colombian Supremo",
      "Colombia",
      anchor.web3.LAMPORTS_PER_SOL, // 1 SOL
      4,
      {
        accounts: {
          coffeeAccount: coffeeAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [coffeeAccount],
      }
    );

    // Purchase coffee
    await program.rpc.buyCoffee({
      accounts: {
        coffeeAccount: coffeeAccount.publicKey,
        buyer: buyer.publicKey,
      },
      signers: [buyer],
    });

    // Verify purchase
    const account = await program.account.coffeeAccount.fetch(coffeeAccount.publicKey);
    assert.isFalse(account.available);
  });
});
