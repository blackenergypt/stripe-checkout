// Carregar os módulos necessários
require('dotenv').config();
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configuração do Express e EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

// Rota para a página de checkout
app.get('/checkout', (req, res) => {
    // Supondo que a informação do produto seja definida assim
    const product = {
        name: "Porsche",
        imageUrl: "https://ymporcar.pt/wp-content/uploads/2021/11/car-1.png",
        price: 4000,
        description: "Descrição do Produto"
    };

    res.render('checkout', { 
        product: product, 
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY 
    });
});


// Rota para criar a sessão de checkout da Stripe
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Porsche',
                    },
                    unit_amount: 4000, // Preço em centavos
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/canceled`,
        });

        res.redirect(303, session.url);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// Rota para a página de sucesso
app.get('/success', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    res.render('success', { session });
});

// Rota para a página de cancelamento
app.get('/canceled', (req, res) => {
    res.render('canceled');
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
