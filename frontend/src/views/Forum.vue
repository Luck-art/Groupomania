<template>
    <div>
        <FlashMessage :position="'right top'"></FlashMessage>
        <section>
        <div class="chip">
            <h2>Bienvenue {{ username }}  !</h2>
        </div> 
        </section>
        <main>
            <h3 class="main_title">Voici les derniers messages:</h3>
            <!--<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvasLabel">-->
                <div class="card text-center main_container">
                    <div class="card-body bg-light container_card"  v-for="(message) in messages" :key="message.id">
                        <div class="card-header">
                            {{ message.id }}
                        </div>
                        <h3 class="card-title">{{ message.title }}</h3>
                        <div class="card-text" v-html="message.content"></div>
                            <p>{{ message.UserId }}</p>
                        <div class="container-like">
                            <button type="button" v-if="$store.state.userId !== message.UserId && alreadyLiked(message) === false " @click="likeMessage(message.id)" class="btn btn-primary button_like">Liker le message</button>
                            <button type="button" v-if="$store.state.userId !== message.UserId && alreadyLiked(message) === true" @click="dislikeMessage(message.id)" class="btn btn-primary">Retirer le like</button>
                            <p>Likes: {{ message.likes }}</p>
                        </div>
                        <p class="card-footer text-muted">Message crée le: {{ formatDate(message.createdAt) }}</p>
                        <div >
                            <button type="button" v-if="$store.state.userId === message.UserId " class="btn btn-secondary selectButton" @click="selectMessage(message)">Sélectionner le message</button>
                            <button type="button" class="btn btn-danger" v-if="$store.state.userId === message.UserId || $store.state.isAdmin === true"  @click="deleteMessage(message)">Supprimer le message</button>
                        </div>
                    </div>
                </div>

            



            <nav aria-label="Page navigation example">
                <ul class="pagination">
                    <li class="page-item">
                    <a class="page-link" @click="goTo(currentPage - 1)"  aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                    </li>
                    <li class="page-item" v-for="(page) in pages" :key="page"><a class="page-link" v-on:click="goTo(page)">{{ page }}</a></li>
                    <li class="page-item">
                    <a class="page-link" @click="goTo(currentPage + 1)"  aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                    </li>
                </ul>
            </nav>
        <!--</div>-->
        </main>
        
       
        <aside>
            <form class="row g-3 form">
                <h2>Exprimez vous!</h2>
                <div class="input-group mb-3">
                    <span class="input-group-text" id="inputGroup-sizing-default">Titre</span>
                    <input type="text" class="form-control" v-model="title" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default">
                </div>
                <editor
                    v-model="content"
                    :init="{
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic backcolor | \
                            alignleft aligncenter alignright alignjustify | \
                            bullist numlist outdent indent | removeformat | help'
                    }">
                </editor>
                <div class="col-12">
                    <button class="btn btn-primary" v-if="isSelected === false" type="button" @click="submitMessage">Envoyer</button>
                    <button class="btn btn-primary" v-else type="button" @click="modifyMessage">Modifier</button>
                    <button class="btn btn-primary cancelModify" v-if="isSelected === true" type="button" @click="cancelModify">Annuler</button>
                </div>
            </form>
        </aside>
    </div>
</template>


<script>
import { axios } from '@/plugins/axios';
import router from '@/router';
import Editor from '@tinymce/tinymce-vue'


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
            pages: 0,
            selectedId: null
        }
    },
    name: 'app',
    components: {
        'editor': Editor
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
            if (this.$store.state.token === null) {
                    router.push('/identify');
                }
    },
    methods: {
        submitMessage: function() {
                axios.post('http://localhost:8081/api/messages/', {
                    content: this.content,
                    title: this.title,
                },
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(() => {
                    this.goTo(1);
                    this.flashMessage.success({title: 'Succes !', message: 'Votre message a bien été enregistré !'});
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
            this.selectedId = message.id;
            const top = document.querySelector('.form').offsetTop;
            window.scrollTo({
                top,
                behavior: 'smooth'
            })
        },
        modifyMessage: function() {
            axios.put('http://localhost:8081/api/messages/' + this.selectedId, {
                    title: this.title,
                    content: this.content,
                },
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(() => {
                    this.goTo(this.currentPage);
                    this.flashMessage.success({title: 'Succes !', message: 'Vos modifications ont bien été enregistrés !'});
                })
                .catch(error => {
                    error.response
                    this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'});
                });
        },
        cancelModify: function() {
            this.isSelected = false; 
            this.title = '';
            this.content = '';
            const top = document.querySelector('.main_title').offsetTop;
            window.scrollTo({
                top,
                behavior: 'smooth'
            })
        },
        deleteMessage: function(message) {
            let text = "Votre message a bien été supprimé !"
            if (message.UserId !== this.$store.state.userId) {
                text = "Le message de l'utilisateur a bien été supprimé !";
            }
            axios.delete('http://localhost:8081/api/messages/' + message.id,
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(() => {
                    this.goTo(this.currentPage);
                    this.flashMessage.success({title: 'Succes !', message: text});
                })
                .catch(error => {
                    error.response
                    this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'});
                });
        },
        likeMessage: function(id) {
            axios.post('http://localhost:8081/api/messages/' + id + '/vote/like', {

            },
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(() => {
                    this.goTo(this.currentPage);
                    this.flashMessage.success({title: 'Succes !', message: 'Message liker !'});
                })
                .catch(error => {
                    error.response
                    this.flashMessage.error({title: 'Erreur !', message: 'Une erreur est survenue !'});
                });
        },
        alreadyLiked: function(message) {
            for (const user of message.Users) {
                if (user.Like.userId === this.$store.state.userId && user.Like.isLike === 1) {
                    return true
                }
            }
            return false
        },
        dislikeMessage: function(id) {
            axios.post('http://localhost:8081/api/messages/' + id + '/vote/dislike', {

            },
                    {
                    headers: {
                            "Authorization" : `Bearer ${this.$store.state.token}`
                            },
                    })
                .then(() => {
                    this.goTo(this.currentPage);
                    this.flashMessage.success({title: 'Succes !', message: 'Message disliké !'});
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
        formatDateModified: function(date) {
            const formatedDateModified = new Date(date);
            return formatedDateModified.toLocaleDateString();
        },
        goTo: function(page)  {
            if (page <= 0 || page > this.pages) {
                return;
            }
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
    .container-like {
        display:flex;
        justify-content:center;
        align-items:baseline;
    }
    .form {
        max-width: 90%;
        min-width: 75%;     
        background-color: rgb(131, 131, 206);
        padding: 0.5%;  
    }
    .selectButton {
        margin-right: 15px;
    }
    .cancelModify {
        margin-left: 15px;
    }
    .button_like {
        margin-right: 15px;
    }
    .pagination {
        justify-content: center;
        margin-top: 15px;
    }
</style>
