{
  // {} Block used to avoid setting global variables

  // const audio = new Audio(
  //   "https://cms-artifacts.motionarray.com/content/motion-array/1068814/Hip_Hop_Sound_Elements_mp3.mp3?Expires=2003734661106&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=VfhsVwLl9ZkHLOuGaraPFUT-5l-Z0-sV1BcyjON5yja8CjbmE4olL9NrODOfHIC0i5sgzo-hA59Qlf-4D6on~nGLfe4mBfBIHUpB66FF3YgaF6Rxylu4E6KfQn6gAXUR9oMw~Z97qt9~jQb38E4BUogxnBIaGxnEalZIZeBpsJVrhvxbTIdyl4I8t342DxOXhihPMpwQ6S5hi-xN3JlzMwO9zAIrWGD0uP2GEUC~82SxmleEKIVnOk2Q2FsXvFmYmAA-zrjIjHerIM8wrKU8uU2xf0OHRi2IIb5vxbZFroXl9yb5xPr0wea8jlMkaXrury5ZsPuCKZSi5mPCJYGE8A__"
  // )

  // const comeToMe = new Audio(
  //   "https://cms-artifacts.motionarray.com/content/motion-array/145884/Devil_Says_Come_To_Me_mp3.mp3?Expires=2003734653332&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=xLaxikYP7bYpm3o9CxxHvw2HkDbl2AzrD29YjQjDgTr1-594jhXkFTX~PV8aDyp9ywAN3dsXmY2Vkcy1BFbr0m6M4B~o3Kh4vC2Sxy~7VtPRMMCIj2axDZoDcNLUfu15XfWL-Nnc31j-cpTrNwKtwSKbOEOO7b2H7ZwMfNfm330tjaMe3VwRYOiDUWEqgcGSOI~0FgioZaEVDJxgapFVwqAk5WPBN~lDcvSzAWRKcvnq0alwh0~E~8VvCfX9WWYor~RyJ2fdUrXiCXsznlwbFp9GGilAf9hyhpVYm7sEG7bYoeV8MwWgokXaNqxRPimqmenhn8KnkTpRYkh1yw3nHg__"
  // )

  const knockDoor = new Audio(
    "https://cms-artifacts.motionarray.com/content/motion-array/1297037/Knock_At_The_Door_mp3.mp3?Expires=2003734670657&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=gFm01Y~XUy5ZaV9Qbb1NkNAxBqw~W41yAd7pkZ3T4hrH64-eRgG2n2nLAvHfRZtHh32yp6uvCBZ7TMFk8-k0UJE47qfFc0vH4mmK23R9IWyp8BlXoklUvNmuIEHgjewGZ1eunytqu8bUtkyRtiUdQhICsz4CVLiAwnBeb4jvqfhk2qzwNZLLV57IrupVx2Ql5FRddSYjFxAV8T3Ibw75Ci1leB8DqAcDpLtsY~A57LGkUKypS2SThxNu1ks0Iccl87h0TJolYOYZqhvN7FCBNaKGDRnZLWq8tDYFmi2yEcmi7JO1Bw8-O7VhLwhV2r45104bdTykdL2Bk64AWx3iFQ__"
  )

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification")
  } else if (Notification.permission === "granted") {
    getJobAlert()
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getJobAlert()
      }
    })
  }

  function getJobAlert() {
    alert("to use the job alert extention, please click on the page firsr.")
    window.addEventListener("load", function () {
      let job = document.querySelector(
        ".up-card-section.up-card-list-section.up-card-hover"
      )
      if (job) {
        setInterval(() => {
          document.querySelector(".up-btn.up-btn-primary").click()
          setTimeout((_) => {
            let newJob = document.querySelector(
              ".up-card-section.up-card-list-section.up-card-hover"
            )
            if (job.id !== newJob.id) {
              const name = newJob.children[0].children[0].children[1].innerText
              const level =
                newJob.children[1].children[0].children[0].children[1].innerText
              const type =
                newJob.children[1].children[0].children[0].children[0].innerText
              const prise =
                newJob.children[1].children[0].children[0].children[2].innerText
              const rate =
                newJob.children[1].children[4].children[1].children[0]
                  .children[0].children[1].children.length
              const country =
                newJob.children[1].children[4].children[3].children[1].innerText
              const spent =
                newJob.children[1].children[4].children[2].children[0].innerText
              const title = "upwork job"
              const icon = ""
              const body = `${name}\n${level} - ${type}\n${prise} - ${rate} ⭐ - ${country} - ${spent}`
              const notification = new Notification(title, { body, icon })
              notification.onclick = (event) => {
                event.preventDefault()
                window.open(
                  newJob.children[0].children[0].children[1].children[0].href,
                  "_blank"
                )
              }

              const playPromise = knockDoor.play()
              if (playPromise !== undefined) {
                playPromise.catch(function (error) {
                  console.log(error)
                  alert("Please interact with the document first.")
                })
              }

              job = newJob
            }
          }, 4000)
        }, 20000)
      }
    })
  }
}
