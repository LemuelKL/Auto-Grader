# Auto-Grader
This code aims to create a web application in which teachers can create, distribute, collect and grade quiz/test/exam papers effortlessly.

## Terminology
- Paper - A quiz/test/exam
- Template - A paper that has not been attempted, the blueprint/draft of the paper itself.
- Candidate - A person who attempts a paper. He is uniquely identified by a candidate ID.
- Tag - A label a teacher can create to facilitate grading. A tag can be created to point out common/general mistakes candidates make in a question. It can be applied to a question during grading. This is sometimes refered as `presetRemark` or `preset` in the code.
- Comment - A string of text a teacher can input and apply to an attempted question. This is sometimes refered as `customRemark` in the code.
- Grading - A abstracted concept of teacher's marking on an attempted question. A Grading can consists of tags, comments and a given score.

## Create
### Import
A teacher can first create a paper using his prefered tool such as Word. He shall prepare his paper in .pdf format. He then imports such pdf file into this application.
### Registering Questions
The teacher is required to manually register the name, score carriage and visual region of each question.

A panel is implemented to facilitate this operation. The panel allows the teacher, using a mouse, to highlight the visual region of a question.
### Setting Candidates
A treeview UI is implemented to allow the teacher to select the participating students. The records of the students are stored and retrieve from a database. The students are grouped into Classes, class A, B, C, D etc. 
### Tags
The teacher can create tags such as "Missing Steps" for the ease of grading. Each tag can be set to be used globally, only in a certain Paper, or only in a certain question. These tags can be applied to each question in the Grading panel.

## Distribution
The backend server recieves the pdf file and requirements specifiied by the teacher.

The server then clone the paper template into each unique pdf file named after each candidate's candidate ID. In each of these pdf file, there is a unique QR Code stamped on the top left corner of each page. The QR Codes contain information of the Paper ID, candidate ID and page number.

The crafted pdf files are written to disk via file system on the server, and served statically under the ./public/ directory. The teacher can retrieve these files under  BASE_URL/papers/PAPER_ID/. The file naming scheme is ${paper_name}---${candidate_id}.pdf

The teacher then distribute these files to candidates accordingly.

## Collection
### Physically Collection
The teacher scans the attempted papers into a pdf file. Then import such file into the application again. The name of the file, order of the pages do not matter. The import can in fact be done separately (Multiple files). The teacher just need to make sure there is no missing pages.
### Digitally Collection
The teacher collects the attempted files by his means. The collected files must be in pdf format. The file name does not matter. The importing order also does not matter.
### UI Design
The user interface should indicate the missing candidates of each import (by comparing the data in the imported file against the initial candidate settings specified by the user during Create).
### Internal Workings
The server recieves the imported files. The server then converts these files, with accordance to the Paper settings (set during Create), into PNG images each containing the visual region of each attempted question of each candidate.

## Grade
A grading panel is implemented for the teacher to grade the attempted questions. Grading is automatically saved on a database.

The panel supposes the teacher wants to grade the Paper in an order of such: Q1 of Amy, Q1 of Ben, Q1 of Christ, then Q2 of Amy, Q2 of  Ben, Q2 of Christ and such.
### Controls
There are various control buttons implemented so that the teacher could tranverse between different questions, candidates or Papers.

There is also a visual panel displaying the question to be graded. The panel allows the teacher to pan and zoom for easy navigation.
### Score
The teacher can give a score to each question, by clicking on a score chip in a chip group.
### Tag
The teacher can assign no, single or multiple tags in his grading. A drop-down selection provides the available tags for the current settings(the current Paper and question).
### Comments
The teacher can input text comments for each grading.
### Graphical Means
The teacher can also append graphics onto the question to be graded. The available options include free drawing lines, shapes such as triangle, rectangle, star, custom images, text, and all of these come with RGB color selection.

## Result
There is a page where candidates can view their own result. Each question has its own  image (modified by the teacher in Grading), score, tags and comment.

This page can be accessed via BASE_URL/Result/CANDIDATE_ID/PAPER_ID
