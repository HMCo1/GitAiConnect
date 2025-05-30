import { Octokit } from "@octokit/rest";

export class GitHubService {
  private getOctokit(token: string) {
    return new Octokit({
      auth: token,
    });
  }

  async getCurrentUser(token: string) {
    const octokit = this.getOctokit(token);
    const { data } = await octokit.rest.users.getAuthenticated();
    return data;
  }

  async getUserRepositories(token: string) {
    const octokit = this.getOctokit(token);
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });
    return data;
  }

  async getRepository(token: string, owner: string, repo: string) {
    const octokit = this.getOctokit(token);
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  }

  async getRepositoryFiles(token: string, fullName: string, branch = "main") {
    const [owner, repo] = fullName.split("/");
    const octokit = this.getOctokit(token);

    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    return data.tree
      .filter((item) => item.type === "blob")
      .map((item) => ({
        path: item.path!,
        sha: item.sha!,
        size: item.size!,
        url: item.url!,
      }));
  }

  async getFileContent(token: string, fullName: string, path: string, branch = "main") {
    const [owner, repo] = fullName.split("/");
    const octokit = this.getOctokit(token);

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (Array.isArray(data) || data.type !== "file") {
      throw new Error("Path is not a file");
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return {
      content,
      sha: data.sha,
      path: data.path,
      size: data.size,
      encoding: data.encoding,
    };
  }

  async getCommits(token: string, fullName: string, branch = "main", perPage = 30) {
    const [owner, repo] = fullName.split("/");
    const octokit = this.getOctokit(token);

    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: perPage,
    });

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author,
      date: commit.commit.author?.date,
      url: commit.html_url,
    }));
  }

  async getPullRequests(token: string, fullName: string, state: "open" | "closed" | "all" = "open") {
    const [owner, repo] = fullName.split("/");
    const octokit = this.getOctokit(token);

    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state,
      per_page: 30,
    });

    return data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      author: pr.user?.login,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      url: pr.html_url,
      draft: pr.draft,
    }));
  }

  async getIssues(token: string, fullName: string, state: "open" | "closed" | "all" = "open") {
    const [owner, repo] = fullName.split("/");
    const octokit = this.getOctokit(token);

    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 30,
    });

    return data
      .filter((issue) => !issue.pull_request) // Exclude PRs
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user?.login,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
        labels: issue.labels.map((label) => 
          typeof label === "string" ? label : label.name
        ),
      }));
  }
}

export const githubService = new GitHubService();
