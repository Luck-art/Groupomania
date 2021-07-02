<template>
    <div>
        <FlashMessage :position="'right bottom'"></FlashMessage>
        <section>
        <div class="chip">
            <h2>Bienvenue {{ username }}  !</h2>
        </div> 
        </section>
        <main>
            <h3>Voici les derniers messages:</h3>
            <!--<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">-->
                <div class="card text-center main_container">
                    <div class="card-body bg-light container_card"  v-for="(message) in messages" :key="message.id">
                        <div class="card-header">
                            {{ message.id }}
                        </div>
                        <h3 class="card-title">{{ message.title }}</h3>
                        <div class="card-text">{{ message.content }}</div>
                        <p>{{ message.UserId }}</p>
                        <p>Likes: {{ message.likes }}</p>
                        <p class="card-footer text-muted">{{ formatDate(message.createdAt) }}</p>
                        <div v-if="$store.state.userId === message.UserId ">
                            <button type="button" class="btn btn-secondary selectButton" @click="selectMessage(message)">Sélectionner le message</button>
                            <button type="button" class="btn btn-danger" v-if="$store.state.userId === UserId.isAdmin" @click="deleteMessage(message.id)">Supprimer le message</button>
                        </div>
                    </div>
                </div>

            



            <nav aria-label="Page navigation example">
                <ul class="pagination">
                    <li class="page-item">
                    <a class="page-link" href="#" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                    </li>
                    <li class="page-item" v-for="(page) in pages" :key="page"><a class="page-link" v-on:click="goTo(page)">{{ page }}</a></li>
                    <li class="page-item">
                    <a class="page-link" href="#" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                    </li>
                </ul>
            </nav>
        <!--</div>-->
        </main>
        
       
        <aside>
            <form class="row g-3 the_form">
                <h2>Exprimez vous!</h2>
                <div class="input-group mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-default">Titre</span>
                    <input type="text" class="form-control" v-model="title" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default">
                </div>
                <div class="mb-3">
                    <label for="exampleFormControlTextarea1" class="form-label">Example textarea</label>
                    <textarea class="form-control" id="exampleFormControlTextarea1" v-model="content" rows="3"></textarea>
                </div>
                <div class="col-12" v-for="(message) in messages" :key="message.id">
                    <button class="btn btn-primary buttonSend" v-if="isSelected === false" type="button" @click="submitMessage">Envoyer</button>
                    <button class="btn btn-primary buttonModify" v-else type="button" @click="modifyMessage(message.id)">Modifier</button>
                </div>
            </form>
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
            title: "",
            content: "",
            messages: "",
            isSelected: false,
            limit: 10, 
            offset: 0, // page * limit - une fois limit
            total: 0,  
            currentPage: 1,
            pages: 0
        }
    },
    mounted: function() {
        axios.get(
            'http://localhost:8081/api/messages/?offset=' + this.offset + '&limit=' + this.limit,
            {
                headers: {"Authorization" : `Bearer ${this.$store.state.token}`}
            }
            ).then(response => {
                this.messages = response.data.rows;
                this.total = response.data.count;
                this.pages = Math.round(this.total / this.limit) 
                console.log(this.messages);
            });
    },
    methods: {
        submitMessage: function() {
            console.log(this.$store.state.token);
                axios.post('http://localhost:8081/api/messages/', {
                    content: this.content,
                    title: this.title,
                },
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(response => {
                    this.flashMessage.success({title: 'Succes !', message: 'Votre message a bien été enregistré !'});
                    console.log(response);
                })
                .catch(error => {
                    error.response
                    this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'});
                });
        },
        selectMessage: function(message) {
            this.isSelected = true;
            this.title = message.title;
            this.content = message.content;
        },
        modifyMessage: function(id) {
            axios.put('http://localhost:8081/api/messages/' + id, {
                    title: this.title,
                    content: this.content,
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
        deleteMessage: function(id) {
            axios.delete('http://localhost:8081/api/messages/' + id,
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(response => {
                    this.flashMessage.success({title: 'Succes !', message: 'Votre message a bien été supprimer !'});
                    console.log(response);
                })
                .catch(error => {
                    error.response
                    this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'});
                });
        },

        // Système de pagination

        formatDate: function(date) {
            const formatedDate = new Date(date);
            return formatedDate.toLocaleDateString();
        },
        goTo: function(page)  {
            /*console.log(page);
            console.log(this);*/
            this.currentPage = page;
            this.offset = page * this.limit - this.limit;
            router.push("/forum?page=" + page);
              axios.get(
            'http://localhost:8081/api/messages/?offset=' + this.offset + '&limit=' + this.limit,
            {
                headers: {"Authorization" : `Bearer ${this.$store.state.token}`}
            }
            ).then(response => {
                this.messages = response.data.rows;
                this.total = response.data.count;
                this.pages = Math.round(this.total / this.limit);
            });
        },  
    }
}
</script>

<style scoped>
    section {
        background-color: rgba(245, 245, 245, 0.822);
    }
    main {
        text-align: center;
        background-color: white;
    }
    aside {
        display: flex;
        justify-content: center;
        background-color: whitesmoke;
        padding: 1.5%;
    }
    .main_container {
        display: flex;
        align-items: center;
        background-color: whitesmoke;
    }
    .container_card {
        margin: 1%;
        max-width: 100%;
        min-width: 75%;
        width: auto;
        box-shadow: 0px 0px , -0.4em 0 .4em rgb(155, 155, 151);
    }
    .the_form {
        max-width: 90%;
        min-width: 75%;     
        background-color: rgb(131, 131, 206);
        padding: 0.5%;  
    }
    .selectButton {
        margin-right: 15px;
    }
    /*.pagination {
        justify-content: center;
    }*/
</style>
