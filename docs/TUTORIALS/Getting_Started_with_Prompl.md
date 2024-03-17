# Getting Started with Prompl

Welcome to your first steps in mastering Prompl! This tutorial will introduce you to the fundamental concepts and commands you'll use to start your journey with Prompl.

## Introduction

Prompl empowers you to harness the capabilities of AI and LLMs through an intuitive syntax designed for ease of use and accessibility. This guide will familiarize you with the essential functions of Prompl.

## Prerequisites

Before starting, ensure you have:

- Access to Prompl’s interface or installation (covered in `INSTALLATION.md`).
- A basic understanding of AI and LLM interaction concepts.

## Understanding Prompl's Syntax

A Prompl command is crafted to mirror natural language, combining an action with a subject and any necessary specifiers to provide clear instructions to the AI. Here's the basic structure of a Prompl command:

- **Action:** The operation you want the AI to perform, such as `summarize`, `translate`, or `analyze`.
- **Subject:** The content you are directing the action towards, which could be a body of `text`, a `data set`, or an `image`.
- **Specifier:** Any additional instructions that modify or refine the action, like `into key points`, `from English to Spanish`, or `using sentiment analysis`.

### Example Command

If you want to summarize a lengthy article, your Prompl command might be structured like this:
summarize [text] into key points


In this command:

- `summarize` is your action, directing Prompl to condense the provided information.
- `[text]` is where you'll input the actual text content or a reference to its location.
- `into key points` is the specifier that tailors the summarization to your desired output form.

### Executing Your First Command

To execute a command, enter it into the Prompl interface, which may be available as a command-line application, a web-based portal, or integrated within another software application. The interface will then process your command and deliver the result.

Here’s a hypothetical example of running the command in a terminal:

```bash
prompl "summarize this text into key points" --input "Path to article.txt"

Upon execution, you'll receive a condensed version of the article highlighting its main points.

As Prompl continues to develop, more complex commands and functionalities will be introduced, enabling even more dynamic interactions with AI.

Now, take some time to experiment with creating your own Prompl commands, and see what you can accomplish. If you have questions or need further guidance, the community forums and support channels are available to assist you.


