-include tpl/Makefile

RES_DIR := res
TPL_DIR := tpl
RES_REPO := git@github.com:ecoslab/ecos-res.git
TPL_REPO := git@github.com:ecoslab/ecos-tpl-mkdocs.git
LINK_TARGETS := src/zh src/en

setup:
	@echo "Checking and setting up directories..."
	@if [ ! -d "$(RES_DIR)" ]; then \
		echo "Cloning res repository..."; \
		git clone $(RES_REPO) $(RES_DIR); \
	else \
		echo "$(RES_DIR) already exists, updating..."; \
		cd $(RES_DIR) && git pull; \
	fi

	@if [ ! -d "$(TPL_DIR)" ]; then \
		echo "Cloning tpl repository..."; \
		git clone $(TPL_REPO) $(TPL_DIR); \
	else \
		echo "$(TPL_DIR) already exists, updating..."; \
		cd $(TPL_DIR) && git pull; \
	fi

	@for target in $(LINK_TARGETS); do \
		if [ ! -e "$$target/res" ]; then \
			echo "Creating symlink: $$target/res -> $(RES_DIR)"; \
			cd $$target && ln -sf ../../res ./ && cd -; \
		else \
			echo "Symlink or file already exists: $$target"; \
		fi; \
	done
	@echo "Setup completed."

.PHONY: setup
