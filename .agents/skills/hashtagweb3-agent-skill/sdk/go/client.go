package hashtagweb3

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type Client struct {
	BaseURL string
}

func NewClient(baseURL ...string) *Client {
	url := "https://hashtagweb3.com/api/v1"
	if len(baseURL) > 0 && baseURL[0] != "" {
		url = baseURL[0]
	}
	return &Client{BaseURL: url}
}

type Job struct {
	ID       string   `json:"id"`
	Title    string   `json:"title"`
	Company  string   `json:"company"`
	Location string   `json:"location"`
	URL      string   `json:"url"`
	Tags     []string `json:"tags"`
}

type JobsResponse struct {
	Jobs []Job `json:"jobs"`
}

func (c *Client) GetJobs(search string, limit int) ([]Job, error) {
	reqURL := fmt.Sprintf("%s/jobs?search=%s&limit=%d", c.BaseURL, url.QueryEscape(search), limit)
	resp, err := http.Get(reqURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("hashtagweb3 API error: HTTP %d", resp.StatusCode)
	}

	var res JobsResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}
	return res.Jobs, nil
}
