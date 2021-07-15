<template>
    <div id="app">
        <main>
            <FlashMessage :position="'right bottom'"></FlashMessage>
            <form class="row g-3 needs-validation  form_main" novalidate>
                <h2>S'identifier</h2>
                <div class="col-md-4">
                    <label for="validationCustom01" class="form-label">Pseudo</label>
                    <input type="text" class="form-control" id="validationCustom01" v-model="username" required>
                    <div class="valid-feedback">
                        Ok!
                    </div>
                </div>
                <div class="col-md-4">
                    <label for="validationCustom02" class="form-label">Mot de passe</label>
                    <input type="password" class="form-control" id="validationCustom02" v-model="password" required>
                    <div class="valid-feedback">
                        Ok!
                    </div>
                </div>
                <div class="col-md-4">
                    <label for="validationCustomUsername" class="form-label">Email</label>
                    <div class="input-group has-validation">
                        <span class="input-group-text" id="inputGroupPrepend">@</span>
                        <input type="text" class="form-control" v-model="email" id="validationCustomUsername" aria-describedby="inputGroupPrepend" required>
                        <div class="invalid-feedback">
                            Veuillez entrer un email valide.
                        </div>
                    </div>
                </div>
                <div class="submit_form">
                    <div class="col-12">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required>
                            <label class="form-check-label" for="invalidCheck">
                                Je suis d'accord avec les termes et les conditions
                            </label>
                            <div class="invalid-feedback">
                                Veuillez accepter les termes et les conditions.
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-dark" type="button" @click="login">Envoyer</button>
                    </div>
                </div>
            </form>
        </main>
    </div>
</template>

<script>
    import { axios } from '@/plugins/axios'
    //import axios from 'axios';
    import router from '@/router';
    
    
    export default {
        
        name:'Identify',
        data: function() {
            return {
                email: '',
                username: '',
                password: '' 
            } 
        },
        methods: {
            login: function() {
                axios.post('http://localhost:8081/api/users/login/', {
                    email: this.email,
                    username: this.username,
                    password: this.password
                })
                    .then(response => {
                        //this.login = response.data.users
                        this.flashMessage.success({title: 'Succes !', message: 'Vous êtes connecté !'});
                        
                        
                        this.$store.dispatch('setUserId', response.data.userId);
                        this.$store.dispatch('setToken', response.data.token);
                        this.$store.dispatch('setUsername', JSON.parse(response.config.data).username);
                        this.$store.dispatch('setIsAdmin', response.data.isAdmin);
                        router.push('/forum');
                        
                    })
                    .catch(error => {
                        console.error(error)
                        this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'})
                    });
            }
        } 
    }


</script>

<style scoped>
    main {
    display: flex;
    justify-content: center;
    background: url("../assets/identify.jpg");
    background-repeat: no-repeat;
    background-position: center;
    min-height: 1300px;
    align-items: center;
}

main h2 {
    text-align: center;
}

.form_main {
    background-color: silver;
    padding-bottom: 12px;
    opacity: 0.90;
    border: 4px solid rgb(231, 222, 222);
}

.col-md-4 {
    width: 100%;
}

footer {
    display: flex;
    background-color: black;
    color: white;
}

.submit_form {
    text-align: center;
}

#invalidCheck {
    float: none;
}

#groupomania_img {
    max-width: 5%;
}

#copyright {
    max-width: 2%;
}
</style>
    
    