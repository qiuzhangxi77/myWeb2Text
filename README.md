# myWeb2Text

## step1: transform DOM to CDOM，and calculate the block and edge features

1. locate into src\main folder
2. put your input html filer here
3. Command line argument: "ts-node main.ts cdomFeatures input.html"

before:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Example Page</title>
  </head>
  <body>
    <header>
      <h1 class="myHeader1 myHeader2">Welcome to Example Page</h1>
    </header>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
    <section>
      <h2 class="myHeader1">About Us</h2>
      <img src="{logo}" className="App-logo" alt="logo" />
      <div>
        <div></div>
      </div>
      <div>click <a className="App-link" href="https://reactjs.org/" target="_blank">Here</a></div>
      <p>This is a brief description of our company.</p>
      <p>
        Apple Inc. is a multinational technology company headquartered in Cupertino, California. It
        is one of the world's largest and most renowned technology companies. Apple designs,
        develops, and sells consumer electronics, computer software, and online services.
      </p>
    </section>
    <section>
      <h2>Contact Information</h2>
      <p>Email: info@example.com</p>
      <p>Phone: 123-456-7890</p>
    </section>
    <footer>
      <p>Apple Example Page. All rights reserved.</p>
    </footer>
  </body>
</html>
```

after:

```
body
    header/h1/#text
    nav/ul
        li/a/#text
        li/a/#text
        li/a/#text
    section
        h2/#text
        div
            #text
            a/#text
        p/#text
        p/#text
    section
        h2/#text
        p/#text
        p/#text
    footer/p/#text
```

## step2: train the cnn network with the cleaneval dataset(python), and get classify labels

1. locate into src\main folder
2. Command line argument: "python python\main.py classify step_1_extracted_features classifyLabelsByPython"

## step3: apply the classify labels to the html, and it should be displayed as text only include main content

1. locate into src\main folder
2. Command line argument: "ts-node main.ts result input.html classifyLabelsByPython output.txt"

the output should be like this:

```
Welcome to Example Page

About Us

click Here

This is a brief description of our company.

 Apple Inc. is a multinational technology company headquartered in Cupertino, California. It is one of the world's largest and most renowned technology companies. Apple designs, develops, and sells consumer electronics, computer software, and online services.

Contact Information

Email: info@example.com

Phone: 123-456-7890

Apple Example Page. All rights reserved.


```

But still not able to get the expected output

debug:
something wrong in the calculation of block features and edge features

Reference: https://github.com/dalab/web2text
