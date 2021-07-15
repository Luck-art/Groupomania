<template>
    <div>
    <FlashMessage :position="'right bottom'"></FlashMessage>
        <section>
            <div class="chip">
                <h2>Bienvenue sur votre espace personnel {{ username }}  !</h2>
            </div> 
        </section>
        <main>
            <form class="row g-3 needs-validation" novalidate> 
                <h3>Modifier mes informations:</h3>
                    <div class="col-md-4 email">
                        <label for="validationCustomUsername" class="form-label">Email</label>
                        <div class="input-group has-validation">
                            <span class="input-group-text" id="inputGroupPrepend">@</span>
                            <input type="email" class="form-control" v-model="user.email" id="validationCustomUsername" aria-describedby="inputGroupPrepend" required>
                            <div class="invalid-feedback">
                                Veuillez choisir un email valide.
                            </div>
                            <div class="valid-feedback">
                                email valide!
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 username">
                        <label for="validationCustom01" class="form-label">Username</label>
                        <input type="text" class="form-control" id="validationCustom01" v-model="user.username" required>
                        <div class="invalid-feedback">
                            Veuillez choisir un username valide.
                        </div>
                        <div class="valid-feedback">
                            username valide!
                        </div>
                    </div>   
                    <div class="mb-3">
                        <label for="validationTextarea" class="form-label">Textarea</label>
                        <textarea class="form-control" id="validationTextarea" v-model="user.bio" required></textarea>
                    </div>
                    <div class="col-12">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="invalidCheck" required>
                            <label class="form-check-label" for="invalidCheck">
                                Je suis d'accord avec les termes et les conditions.
                            </label>
                            <div class="invalid-feedback">
                                Vous devez accepter les termes et les conditions.
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-primary" @click="modifyInfos" type="button">Modifier</button>
                    </div>
                </form>
        </main>
        <aside>
            <div class="card bg-secondary">
                <div class="card-header bg-dark">
                    Suppression de compte
                </div>
                <div class="card-body">
                    <p class="card-text">Attention! Les données liées à votre compte seront perdues.</p>
                    <p>Votre compte:</p>
                    <button class="btn btn-danger"  @click="deleteAccount" type="button">Supprimer mon compte</button>                </div>
            </div>
        </aside>
    </div>
</template>

<script>
import { axios } from '@/plugins/axios';
import router from '@/router';

export default {
    data: function() {
        return {
            username:  this.$store.state.username,
            userId: this.$store.state.userId,
            user: {},
        }
    },
    async created() {
        if (this.$store.state.token === null) {
                        router.push('/');
                    }
        const data = (await axios.get(
            'http://localhost:8081/api/users/' + this.$store.state.userId,
                {
                    headers: {"Authorization" : `Bearer ${this.$store.state.token}`}
                }
            )).data;
                this.user = data;
    },
    methods: {
        modifyInfos: function() {
                axios.put('http://localhost:8081/api/users/' + this.$store.state.userId, {
                    email: this.user.email,
                    username: this.user.username,
                    bio: this.user.bio
                },
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(response => {
                    this.flashMessage.success({title: 'Succes !', message: 'Vos modifications ont bien été enregistrés !'});
                    console.log(response);
                })
                .catch(error => {
                    error.response
                    this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'});
                });
        },
        deleteAccount: function () {
             
            axios.delete('http://localhost:8081/api/users/' + this.$store.state.userId ,
                {
                headers: {
                        "Authorization" : `Bearer ${this.$store.state.token}`
                        },
                }
            )
            .then(response => {
                this.flashMessage.success({title: 'Succes !', message: 'Votre compte a été supprimé !'});
                console.log(response);             
            })
            .catch(error => {
                error.response
                this.flashMessage.error({title: 'Erreur !', message: 'Nous navons pas pue supprimer votre compte !'});
            });
            console.log(this.response)
            console.log(this.user);
        }
    }
}
</script>

<style scoped>
    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        /*max-width: 80%;
        min-width: 75%;*/     
        background-color: rgb(131, 131, 206);
        padding: 0.5%;  
        margin: 2% ;
    }
    .email {
        width: 100%;
    }
    .username {
        width: 100%;
    }
    .card {       
        margin: 2% ;
        color: white;
    }
</style>
