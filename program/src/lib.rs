use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("YourProgramIDWillBeHereAfterDeployment");

#[program]
pub mod coffee_stylus {
    use super::*;

    #[derive(Accounts)]
    pub struct Initialize<'info> {
        #[account(init, payer = user, space = 8 + 32 + 4 + 4 + 1 + 4)]
        pub coffee_account: Account<'info, CoffeeAccount>,
        #[account(mut)]
        pub user: Signer<'info>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct BuyCoffee<'info> {
        #[account(mut)]
        pub coffee_account: Account<'info, CoffeeAccount>,
        #[account(mut)]
        pub buyer: Signer<'info>,
    }

    #[account]
    pub struct CoffeeAccount {
        pub name: String,       // Coffee name
        pub origin: String,     // Country of origin
        pub price: u32,         // Price in lamports
        pub roast_level: u8,    // 1-5 scale
        pub available: bool,    // Availability status
    }

    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        origin: String,
        price: u32,
        roast_level: u8,
    ) -> ProgramResult {
        let coffee = &mut ctx.accounts.coffee_account;
        coffee.name = name;
        coffee.origin = origin;
        coffee.price = price;
        coffee.roast_level = roast_level;
        coffee.available = true;
        Ok(())
    }

    pub fn buy_coffee(ctx: Context<BuyCoffee>) -> ProgramResult {
        let coffee = &mut ctx.accounts.coffee_account;
        require!(coffee.available, CoffeeError::NotAvailable);
        
        // Transfer logic would go here in a real implementation
        coffee.available = false;
        Ok(())
    }
}

#[error_code]
pub enum CoffeeError {
    #[msg("Coffee is not available")]
    NotAvailable,
}
