<template>
<div>
    <main>
          <div class="hero-image">
            <img src="../assets/banniere.jpg" id="banniere">
            <div class="hero-text">
              <h1>Groupomania</h1>
              <p>Bienvenue sur l'application du groupe!</p>
            </div>
          </div> 
    </main>

    <aside>
          <div class="top_aside">
          <h2>Découvrez votre application en quelques points:</h2>
          <p>A quoi sert cette application?</p>
          </div>
          
          <button class="collapsible">Créer votre compte peut importe ou vous vous trouvez!</button>
          <div class="inside_collapsible">
            <p>Cette application vous permet de créer votre compte autant bien sur un téléphone mobile qu'une tablette ou encore votre ordinateur.<br/>
              Cela vous permettra d'accèder à l'application pendant vos heures de travail, votre pause ou encore de chez vous!</p>
          </div>
          
          <button class="collapsible">Votre compte ne vous satisfait plus?</button>
          <div class="inside_collapsible">
            <p>Aucuns problèmes! C'est votre compte et c'est donc vous et vous seul qui décidé. Vous pouvez supprimer votre compte en un clic et en recréer un à tout moment!</p>
          </div>
          
          <button class="collapsible">Publiez les contenues multimédias à volonté!</button>
          <div class="inside_collapsible">
            <p>Vous avez besoin que l'on vérifie un travail, vous voulez partager un document à vos collègues, ou encore tout simplement envoyer un gif pour rigoler?<br/>
            Aucuns soucis, nous avons pensés à tout pour vous et tout cela est possible et de façon très simple! Alors n'hésitez pas!</p>
          </div> 

          <button class="collapsible">Vous voulez vous exprimer?</button>
          <div class="inside_collapsible">
            <p>Nous avons également pensés à réaliser un forum pour les employés de l'entreprise, peu importe ce dont vous avez besoin, n'hesitez pas et exprimez vous!<br/>
            Vous avez besoin d'aide pour un travail, vous avez besoin d'une adresse mail d'un de vos collègues, vous pensez que vous aurez du retard? Tout est la pour vous!</p>
          </div> 

          <button class="collapsible" text="">Vous êtes chargé-e de communication?</button>
          <div class="inside_collapsible">
            <p>Vous avez un status particulier qui vous permet de modérer les interactions entre les salariés pour assurer que l'ambiance reste bonne.
               La modération est très simple d'utilisation, vous n'avez pas de soucis à vous faire par rapport à cela, tout a été pensé pour vous!</p>
          </div> 
    </aside>
</div>
</template>

<script>
import Index from '../css/Index.css'
export default ({
    name: 'Index',
    css: {
        Index
    },
    mounted() {
        const coll = document.getElementsByClassName("collapsible");
            for ( let i = 0; i < coll.length; i++) {
                coll[i].addEventListener("click", function() {
                    this.classList.toggle("active");
                    const insideCollapsible = this.nextElementSibling;
                    if (insideCollapsible.style.maxHeight){
                        insideCollapsible.style.maxHeight = null;
                    } else {
                        insideCollapsible.style.maxHeight = insideCollapsible.scrollHeight + "px";
                    }
                });
            }
    }
})
</script>
