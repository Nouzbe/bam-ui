# bam-ui

bam-ui is a set of presentational React Components that can be used to build web applications. It contains:

  - bam-scroller
  - bam-table

### Usage
```sh
todo
```

### Working on the showcase
Install
```
$ cd /example
$ yarn
```
Launch in development mode on your port 3000, using the last published build of every component:
```
$ yarn start
```
### Working on a component
Let's say that you want to improve bam-table for example. You need to:
```
$ cd /table
$ yarn
$ npm link
$ yarn start
```
And
```
$ cd /example
$ yarn
$ npm link bam-table
$ yarn start
```
This will launch the showcase in development mode using your current source for bam-table.

Note that if you need to work on several components simultaneously, you can also:
```
$ yarn
$ yarn setup
$ yarn start
```
From the root of the project. This will install bam-ui itself, then install every component and finally start them as well as the showcase in development mode. You still have to make sure that you have linked all the components on which you are going to work.